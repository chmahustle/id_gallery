/**
 * Сервер для браузерных тестов (Playwright): сайт из dist/ и API на отдельной
 * базе id_gallery_e2e. Перед запуском база очищается — тесты начинают с
 * данных из кода. Логин и пароль — тестовые, из testServer.ts.
 */
import 'dotenv/config'
import pg from 'pg'
import { ensureEmbeddedPostgres } from '../embedded-pg.js'
import { startTestServer } from './testServer.js'

const PORT = Number(process.env.E2E_PORT || 3098)

/* встроенная база не запущена (npm run dev выключен) — поднять её на время тестов */
async function databaseReachable() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  try {
    await client.connect()
    return true
  } catch {
    return false
  } finally {
    await client.end().catch(() => {})
  }
}
if (process.env.DATABASE_URL && !(await databaseReachable())) {
  await ensureEmbeddedPostgres()
}

const ctx = await startTestServer({ database: 'id_gallery_e2e', port: PORT })
if (!ctx) {
  console.error('PostgreSQL недоступен — браузерные тесты не запустятся')
  process.exit(1)
}
await ctx.pool.query(
  'TRUNCATE content_overrides, products, brand_records, site_texts, media_slots, admin_sessions, user_sessions, users',
)
console.log(`E2E ${ctx.base}`)
