import 'dotenv/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import {
  SESSION_COOKIE,
  allowLoginAttempt,
  checkCredentials,
  clearLoginAttempts,
  clearSessionCookieOptions,
  createSession,
  credentialsConfigured,
  destroySession,
  isValidSession,
  sessionCookieOptions,
} from './auth.js'
import { initDb } from './db.js'
import { ensureEmbeddedPostgres } from './embedded-pg.js'
import brandsRouter from './brands.js'
import mediaRouter, { UPLOAD_ROOT, ensureUploadsDir } from './media.js'
import newsRouter from './news.js'
import textsRouter from './texts.js'
import usersRouter from './users.js'

const PORT = Number(process.env.PORT || 3001)

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use('/uploads', express.static(UPLOAD_ROOT, { fallthrough: false }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: 'postgresql' })
})

app.get('/api/auth/me', async (req, res, next) => {
  try {
    const ok = await isValidSession(req.cookies?.[SESSION_COOKIE])
    res.json({
      authed: ok,
      configured: credentialsConfigured(),
    })
  } catch (err) {
    next(err)
  }
})

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown'
    if (!allowLoginAttempt(ip)) {
      res.status(429).json({ error: 'Слишком много попыток входа. Подождите 15 минут.' })
      return
    }
    if (!credentialsConfigured()) {
      res.status(503).json({
        error: 'Логин/пароль не заданы в .env (ADMIN_LOGIN / ADMIN_PASSWORD)',
      })
      return
    }
    const login = String(req.body?.login ?? '').trim()
    const password = String(req.body?.password ?? '')
    if (!checkCredentials(login, password)) {
      res.status(401).json({ error: 'Неверный логин или пароль' })
      return
    }
    clearLoginAttempts(ip)
    const { token, expires } = await createSession()
    res.cookie(SESSION_COOKIE, token, sessionCookieOptions(expires))
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

app.post('/api/auth/logout', async (req, res, next) => {
  try {
    await destroySession(req.cookies?.[SESSION_COOKIE])
    res.clearCookie(SESSION_COOKIE, clearSessionCookieOptions())
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

app.use('/api/texts', textsRouter)
app.use('/api/media', mediaRouter)
app.use('/api/news', newsRouter)
app.use('/api/brands', brandsRouter)
app.use('/api/account', usersRouter)

app.use((err, _req, res, _next) => {
  console.error(err)
  const status = err?.status || err?.statusCode || 500
  res.status(status).json({ error: err?.message || 'Ошибка сервера' })
})

await ensureUploadsDir()
await ensureEmbeddedPostgres()
await initDb()

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT} (PostgreSQL)`)
  if (!credentialsConfigured()) {
    console.warn('ADMIN_LOGIN / ADMIN_PASSWORD не заданы — вход в админку недоступен')
  }
})
