import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import EmbeddedPostgres from 'embedded-postgres'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, '.data', 'pg')

let instance = null

function shouldUseEmbedded() {
  if (process.env.USE_EMBEDDED_PG === '0') return false
  if (process.env.USE_EMBEDDED_PG === '1') return true
  const url = process.env.DATABASE_URL || ''
  return url.includes(':54329') || url.includes('127.0.0.1:54329')
}

export async function ensureEmbeddedPostgres() {
  if (!shouldUseEmbedded()) return null
  if (instance) return instance

  const port = Number(process.env.EMBEDDED_PG_PORT || 54329)
  const user = process.env.EMBEDDED_PG_USER || 'postgres'
  const password = process.env.EMBEDDED_PG_PASSWORD || 'password'
  const database = process.env.EMBEDDED_PG_DATABASE || 'id_gallery'

  fs.mkdirSync(DATA_DIR, { recursive: true })

  const asRoot = typeof process.getuid === 'function' && process.getuid() === 0

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user,
    password,
    port,
    persistent: true,
    // Postgres binaries refuse to run as root (e.g. some CI/Docker setups)
    createPostgresUser: asRoot,
  })

  if (!fs.existsSync(path.join(DATA_DIR, 'PG_VERSION'))) {
    console.log(`[pg] initialise cluster in ${DATA_DIR}`)
    await pg.initialise()
  }

  console.log(`[pg] starting embedded PostgreSQL on :${port}`)
  await pg.start()

  try {
    await pg.createDatabase(database)
    console.log(`[pg] database "${database}" ready`)
  } catch (err) {
    const msg = String(err?.message || err)
    if (!/already exists/i.test(msg)) throw err
  }

  process.env.DATABASE_URL =
    process.env.DATABASE_URL ||
    `postgresql://${user}:${password}@127.0.0.1:${port}/${database}`

  instance = pg

  const stop = async () => {
    try {
      await pg.stop()
    } catch {
      /* ignore */
    }
  }
  process.once('SIGINT', stop)
  process.once('SIGTERM', stop)

  return pg
}
