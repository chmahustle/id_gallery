import type { Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import 'dotenv/config'
import pg from 'pg'

/* тестовые учётные данные — только для тестов, в .env не попадают */
export const TEST_LOGIN = 'tester'
export const TEST_PASSWORD = 'test-password-strong-42'

/**
 * Сервер для тестов на отдельной базе id_gallery_test (создаётся сама).
 * Нет PostgreSQL — возвращает null, и тесты сервера пропускаются.
 */
export async function startTestServer() {
  const source = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
  if (!source) return null
  const url = new URL(source)
  const testDb = process.env.TEST_DATABASE_URL ? url.pathname.slice(1) : 'id_gallery_test'
  if (!process.env.TEST_DATABASE_URL) {
    const admin = new URL(source)
    admin.pathname = '/postgres'
    const client = new pg.Client({ connectionString: admin.toString() })
    try {
      await client.connect()
      const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [testDb])
      if (!exists.rowCount) await client.query(`CREATE DATABASE ${testDb}`)
    } catch {
      return null
    } finally {
      await client.end().catch(() => {})
    }
  }
  url.pathname = `/${testDb}`
  process.env.DATABASE_URL = url.toString()
  process.env.ADMIN_LOGIN = TEST_LOGIN
  process.env.ADMIN_PASSWORD = TEST_PASSWORD
  process.env.COOKIE_SECURE = '0'

  const { initDb, pool } = await import('../db.js')
  const { createApp } = await import('../app.js')
  const { ensureUploadsDir } = await import('../media.js')
  await ensureUploadsDir()
  await initDb()
  const server = await new Promise<Server>((resolve) => {
    const s = createApp().listen(0, () => resolve(s))
  })
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  return {
    base,
    pool,
    async close() {
      await new Promise((resolve) => server.close(resolve))
      await pool.end()
    },
  }
}

/** Вход администратора: cookie сессии для следующих запросов */
export async function login(base: string, login = TEST_LOGIN, password = TEST_PASSWORD) {
  const response = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ login, password }),
  })
  const cookie = (response.headers.get('set-cookie') || '').split(';')[0]
  return { status: response.status, cookie }
}
