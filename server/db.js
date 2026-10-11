import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const { Pool } = pg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql:///id_gallery?host=/var/run/postgresql'

export const pool = new Pool({
  connectionString: DATABASE_URL,
})

export async function query(text, params) {
  return pool.query(text, params)
}

export async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  await pool.query(`DELETE FROM admin_sessions WHERE expires_at < now()`)
}
