import crypto from 'node:crypto'
import type { CookieOptions, NextFunction, Request, Response } from 'express'
import { query } from './db.js'

const COOKIE = 'id_gallery_admin'
const SESSION_DAYS = 7
const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 10
const loginAttempts = new Map()

/*
 * Единственный администратор — логин и пароль только из .env
 * (ADMIN_LOGIN / ADMIN_PASSWORD). В базе пользователей-админов нет.
 */
function adminLogin() {
  return String(process.env.ADMIN_LOGIN || '').trim()
}

function adminPassword() {
  return String(process.env.ADMIN_PASSWORD || '')
}

const MIN_PASSWORD = 12
/* пароли из примеров и самые частые — с ними вход не включается */
const WEAK_PASSWORDS = new Set([
  'admin',
  'admin123',
  'password',
  'password123',
  'qwerty123',
  '12345678',
  '123456789',
  'смените-пароль-админки',
  'change-me',
])

/** Почему пароль из .env не подходит; пустая строка — подходит */
export function passwordProblem() {
  const password = adminPassword()
  if (!password) return 'ADMIN_PASSWORD не задан'
  if (password.length < MIN_PASSWORD) return `ADMIN_PASSWORD короче ${MIN_PASSWORD} символов`
  if (WEAK_PASSWORDS.has(password.toLowerCase())) return 'ADMIN_PASSWORD — пароль из примера'
  if (password.toLowerCase() === adminLogin().toLowerCase())
    return 'ADMIN_PASSWORD совпадает с логином'
  return ''
}

export function credentialsConfigured() {
  return Boolean(adminLogin()) && !passwordProblem()
}

/*
 * Отпечаток логина и пароля: сессия помнит, с какими данными входили.
 * Сменили пароль в .env и перезапустили сервер — старые сессии не действуют.
 */
function credentialsFingerprint() {
  return crypto
    .createHash('sha256')
    .update(`id-gallery-admin\n${adminLogin()}\n${adminPassword()}`)
    .digest('hex')
}

function safeEqualString(a: unknown, b: unknown) {
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

export function checkCredentials(login: string, password: string) {
  if (!credentialsConfigured()) return false
  return safeEqualString(login, adminLogin()) && safeEqualString(password, adminPassword())
}

export function allowLoginAttempt(ip: string) {
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

export function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip || 'unknown')
}

export async function createSession() {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await query(`INSERT INTO admin_sessions (token, expires_at, credentials) VALUES ($1, $2, $3)`, [
    token,
    expires.toISOString(),
    credentialsFingerprint(),
  ])
  return { token, expires }
}

export async function destroySession(token: string | undefined) {
  if (!token) return
  await query(`DELETE FROM admin_sessions WHERE token = $1`, [token])
}

export async function isValidSession(token: unknown) {
  if (!credentialsConfigured()) return false
  if (!token || typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return false
  await query(`DELETE FROM admin_sessions WHERE expires_at < now()`)
  const result = await query(
    `SELECT 1 FROM admin_sessions WHERE token = $1 AND expires_at > now() AND credentials = $2`,
    [token, credentialsFingerprint()],
  )
  return (result.rowCount ?? 0) > 0
}

export function sessionCookieOptions(expires: Date): CookieOptions {
  return {
    httpOnly: true,
    /* cookie админки не уходит с чужих сайтов, даже по ссылке */
    sameSite: 'strict',
    secure: cookieSecure(),
    path: '/',
    expires,
  }
}

export function clearSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: cookieSecure(),
    path: '/',
  }
}

export const SESSION_COOKIE = COOKIE

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
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

/**
 * Cookie только по HTTPS. В продакшене включено; если сайт открывают
 * по http (например, по IP до настройки домена), задайте COOKIE_SECURE=0.
 */
export function cookieSecure() {
  if (process.env.COOKIE_SECURE === '0') return false
  if (process.env.COOKIE_SECURE === '1') return true
  return process.env.NODE_ENV === 'production'
}
