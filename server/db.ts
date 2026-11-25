import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg, { type QueryResult, type QueryResultRow } from 'pg'

const { Pool } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql:///id_gallery?host=/var/run/postgresql'

export const pool = new Pool({
  connectionString: DATABASE_URL,
})

/** Запрос к базе; строки ответа — любой формы, если тип не указан */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<R extends QueryResultRow = any>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<R>> {
  return pool.query<R>(text, params)
}

export async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  await pool.query(`DELETE FROM admin_sessions WHERE expires_at < now()`)
  await pool.query(`DELETE FROM user_sessions WHERE expires_at < now()`)
}
