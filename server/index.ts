import 'dotenv/config'
import { createApp } from './app.js'
import { credentialsConfigured, passwordProblem } from './auth.js'
import { initDb } from './db.js'
import { ensureEmbeddedPostgres } from './embedded-pg.js'
import { ensureUploadsDir } from './media.js'

const PORT = Number(process.env.PORT || 3001)

await ensureUploadsDir()
await ensureEmbeddedPostgres()
await initDb()

createApp().listen(PORT, () => {
  console.log(`API http://localhost:${PORT} (PostgreSQL)`)
  if (!credentialsConfigured()) {
    console.warn(
      `Вход в админку отключён: ${passwordProblem() || 'ADMIN_LOGIN не задан'} (файл .env)`,
    )
  }
})
