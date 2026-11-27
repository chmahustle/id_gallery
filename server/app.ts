import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cookieParser from 'cookie-parser'
import express, { type NextFunction, type Request, type Response } from 'express'
import {
  SESSION_COOKIE,
  allowLoginAttempt,
  checkCredentials,
  clearLoginAttempts,
  clearSessionCookieOptions,
  cookieSecure,
  createSession,
  credentialsConfigured,
  destroySession,
  isValidSession,
  sessionCookieOptions,
} from './auth.js'
import brandRecordsRouter from './brandRecords.js'
import contentRouter from './content.js'
import productsRouter from './products.js'
import uploadsRouter from './uploads.js'
import { UPLOAD_ROOT } from './media.js'
import newsRouter from './news.js'
import textsRouter from './texts.js'
import usersRouter from './users.js'

/**
 * Приложение Express без запуска: маршруты, заголовки, защита.
 * Запуск (база, порт) — в index.js; тесты создают приложение отдельно.
 */
export function createApp() {
  const app = express()
  /* за nginx / балансировщиком: настоящий IP клиента для ограничения попыток входа */
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1)

  app.disable('x-powered-by')

  /* заголовки безопасности для всех ответов */
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    if (cookieSecure()) {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains')
    }
    next()
  })

  /*
   * Сайт и API на одном адресе (в разработке — через прокси Vite), поэтому
   * CORS не нужен: запросы с чужих сайтов браузер не пропустит.
   * Изменяющие запросы с чужим Origin отклоняются (защита от CSRF).
   */
  app.use('/api', (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next()
    const origin = req.get('origin')
    if (origin) {
      let host = ''
      try {
        host = new URL(origin).host
      } catch {
        host = ''
      }
      const expected =
        (app.get('trust proxy') && req.get('x-forwarded-host')?.split(',')[0].trim()) ||
        req.get('host')
      if (host !== expected) {
        res.status(403).json({ error: 'Запрос с другого сайта отклонён' })
        return
      }
    }
    next()
  })

  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use(
    '/uploads',
    express.static(UPLOAD_ROOT, {
      fallthrough: false,
      dotfiles: 'deny',
      setHeaders: (res, filePath) => {
        /* SVG может содержать скрипты: открытый напрямую — без выполнения */
        if (/\.svg$/i.test(filePath)) {
          res.setHeader(
            'Content-Security-Policy',
            "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
          )
        }
      },
    }),
  )

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
          error: 'Вход отключён: задайте ADMIN_LOGIN и надёжный ADMIN_PASSWORD в .env',
        })
        return
      }
      const login = String(req.body?.login ?? '')
        .trim()
        .slice(0, 200)
      const password = String(req.body?.password ?? '').slice(0, 200)
      if (!checkCredentials(login, password)) {
        /* пауза замедляет перебор паролей */
        await new Promise((resolve) => setTimeout(resolve, 600))
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
  app.use('/api/news', newsRouter)
  app.use('/api/account', usersRouter)
  app.use('/api/content', contentRouter)
  app.use('/api/products', productsRouter)
  app.use('/api/brand-records', brandRecordsRouter)
  app.use('/api/upload', uploadsRouter)

  /*
   * Продакшен (Docker): тот же сервер отдаёт собранный сайт из dist/.
   * Любой адрес вне /api и /uploads получает index.html — маршруты SPA.
   */
  const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
  if (fs.existsSync(path.join(DIST, 'index.html'))) {
    app.use(express.static(DIST, { index: false, maxAge: '1h' }))
    app.get(/^(?!\/api\/|\/uploads\/).*/, (_req, res) => {
      res.sendFile(path.join(DIST, 'index.html'))
    })
  }

  app.use(
    (
      err: Error & { status?: number; statusCode?: number },
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      console.error(err)
      const status = Number(err?.status || err?.statusCode) || 500
      /* подробности внутренних ошибок (база, пути) наружу не отдаются */
      res
        .status(status)
        .json({ error: status < 500 && err?.message ? err.message : 'Ошибка сервера' })
    },
  )
  return app
}
