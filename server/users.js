import crypto from 'node:crypto'
import { Router } from 'express'
import { query } from './db.js'

const COOKIE = 'id_gallery_user'
const SESSION_DAYS = 30
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 30
const loginAttempts = new Map()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function allowAttempt(ip) {
  const key = ip || 'unknown'
  const now = Date.now()
  const entry = loginAttempts.get(key) || { count: 0, start: now }
  if (now - entry.start > LOGIN_WINDOW_MS) {
    entry.count = 0
    entry.start = now
  }
  entry.count += 1
  loginAttempts.set(key, entry)
  return entry.count <= LOGIN_MAX_ATTEMPTS
}

function clearAttempts(ip) {
  loginAttempts.delete(ip || 'unknown')
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(password, salt, 64)
  return `${salt.toString('hex')}:${hash.toString('hex')}`
}

function verifyPassword(password, stored) {
  if (!stored || typeof stored !== 'string' || !stored.includes(':')) return false
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const actual = crypto.scryptSync(password, salt, expected.length)
  return (
    expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
  )
}

function cookieOptions(expires) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  }
}

function clearCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
  }
}

async function createUserSession(userId) {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await query(
    `INSERT INTO user_sessions (token, user_id, expires_at) VALUES ($1, $2, $3)`,
    [token, userId, expires.toISOString()],
  )
  return { token, expires }
}

async function destroyUserSession(token) {
  if (!token) return
  await query(`DELETE FROM user_sessions WHERE token = $1`, [token])
}

async function findUserBySession(token) {
  if (!token || typeof token !== 'string' || token.length < 32) return null
  await query(`DELETE FROM user_sessions WHERE expires_at < now()`)
  const result = await query(
    `SELECT u.id, u.email, u.name
     FROM user_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [token],
  )
  return result.rows[0] || null
}

function validateEmail(email) {
  return EMAIL_RE.test(email)
}

const router = Router()

router.get('/me', async (req, res, next) => {
  try {
    const user = await findUserBySession(req.cookies?.[COOKIE])
    res.json({ user: user ? publicUser(user) : null })
  } catch (err) {
    next(err)
  }
})

router.post('/register', async (req, res, next) => {
  try {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown'
    if (!allowAttempt(ip)) {
      res.status(429).json({ error: 'Слишком много попыток. Подождите 15 минут.' })
      return
    }

    const name = String(req.body?.name ?? '').trim()
    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const password = String(req.body?.password ?? '')

    if (name.length < 2 || name.length > 80) {
      res.status(400).json({ error: 'Укажите имя (от 2 до 80 символов)' })
      return
    }
    if (!validateEmail(email) || email.length > 254) {
      res.status(400).json({ error: 'Укажите корректный email' })
      return
    }
    if (password.length < 6 || password.length > 128) {
      res.status(400).json({
        error: 'Пароль должен быть от 6 до 128 символов',
      })
      return
    }

    const existing = await query(`SELECT id FROM users WHERE lower(email) = $1`, [
      email,
    ])
    if (existing.rowCount > 0) {
      res.status(409).json({ error: 'Пользователь с таким email уже зарегистрирован' })
      return
    }

    const passwordHash = hashPassword(password)
    let user
    try {
      const inserted = await query(
        `INSERT INTO users (email, name, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, name`,
        [email, name, passwordHash],
      )
      user = inserted.rows[0]
    } catch (err) {
      if (err?.code === '23505') {
        res.status(409).json({
          error: 'Пользователь с таким email уже зарегистрирован',
        })
        return
      }
      throw err
    }
    clearAttempts(ip)
    const { token, expires } = await createUserSession(user.id)
    res.cookie(COOKIE, token, cookieOptions(expires))
    res.status(201).json({ user: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown'
    if (!allowAttempt(ip)) {
      res.status(429).json({ error: 'Слишком много попыток. Подождите 15 минут.' })
      return
    }

    const email = String(req.body?.email ?? '').trim().toLowerCase()
    const password = String(req.body?.password ?? '')

    if (!validateEmail(email) || email.length > 254 || !password) {
      res.status(400).json({ error: 'Укажите email и пароль' })
      return
    }
    if (password.length > 128) {
      res.status(400).json({ error: 'Неверный email или пароль' })
      return
    }

    const result = await query(
      `SELECT id, email, name, password_hash FROM users WHERE lower(email) = $1`,
      [email],
    )
    const row = result.rows[0]
    if (!row || !verifyPassword(password, row.password_hash)) {
      res.status(401).json({ error: 'Неверный email или пароль' })
      return
    }

    clearAttempts(ip)
    const { token, expires } = await createUserSession(row.id)
    res.cookie(COOKIE, token, cookieOptions(expires))
    res.json({ user: publicUser(row) })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', async (req, res, next) => {
  try {
    await destroyUserSession(req.cookies?.[COOKIE])
    res.clearCookie(COOKIE, clearCookieOptions())
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
