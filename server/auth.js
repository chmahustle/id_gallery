import crypto from 'node:crypto'
import { query } from './db.js'

const COOKIE = 'id_gallery_admin'
const SESSION_DAYS = 7
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 20
const loginAttempts = new Map()

function adminLogin() {
  return process.env.ADMIN_LOGIN || ''
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || ''
}

export function credentialsConfigured() {
  return Boolean(adminLogin() && adminPassword())
}

function safeEqualString(a, b) {
  const left = Buffer.from(String(a))
  const right = Buffer.from(String(b))
  const size = Math.max(left.length, right.length, 1)
  const paddedLeft = Buffer.alloc(size)
  const paddedRight = Buffer.alloc(size)
  left.copy(paddedLeft)
  right.copy(paddedRight)
  const same = crypto.timingSafeEqual(paddedLeft, paddedRight)
  return same && left.length === right.length
}

export function checkCredentials(login, password) {
  if (!credentialsConfigured()) return false
  return (
    safeEqualString(login, adminLogin()) &&
    safeEqualString(password, adminPassword())
  )
}

export function allowLoginAttempt(ip) {
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

export function clearLoginAttempts(ip) {
  loginAttempts.delete(ip || 'unknown')
}

export async function createSession() {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await query(
    `INSERT INTO admin_sessions (token, expires_at) VALUES ($1, $2)`,
    [token, expires.toISOString()],
  )
  return { token, expires }
}

export async function destroySession(token) {
  if (!token) return
  await query(`DELETE FROM admin_sessions WHERE token = $1`, [token])
}

export async function isValidSession(token) {
  if (!token || typeof token !== 'string' || token.length < 32) return false
  await query(`DELETE FROM admin_sessions WHERE expires_at < now()`)
  const result = await query(
    `SELECT 1 FROM admin_sessions WHERE token = $1 AND expires_at > now()`,
    [token],
  )
  return result.rowCount > 0
}

export function sessionCookieOptions(expires) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  }
}

export function clearSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}

export const SESSION_COOKIE = COOKIE

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[SESSION_COOKIE]
    if (!(await isValidSession(token))) {
      res.status(401).json({ error: 'Требуется вход' })
      return
    }
    next()
  } catch (err) {
    next(err)
  }
}
