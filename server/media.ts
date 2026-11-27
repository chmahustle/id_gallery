import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Папка загруженных файлов (фото, документы). Её раздаёт /uploads,
 * в неё пишут загрузки админки. Тесты подменяют её через UPLOAD_DIR,
 * чтобы не трогать настоящие файлы.
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../uploads')

export async function ensureUploadsDir() {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true })
}
