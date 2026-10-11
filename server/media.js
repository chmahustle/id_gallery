import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Router } from 'express'
import multer from 'multer'
import { MEDIA_SLOTS, getDefaultMap } from '../src/media/defaults.js'
import { requireAuth } from './auth.js'
import { query } from './db.js'
import { isAllowedMediaUrl } from './mediaUrl.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_ROOT = path.resolve(__dirname, '../uploads')
const SLOT_IDS = new Set(MEDIA_SLOTS.map((slot) => slot.id))
const MAX_IMAGE = 20 * 1024 * 1024
const MAX_VIDEO = 120 * 1024 * 1024

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').slice(0, 16) || ''
      const safeExt = /^\.[a-z0-9]+$/i.test(ext) ? ext.toLowerCase() : ''
      const id = String(req.params.id || 'file').replace(/[^a-zA-Z0-9_-]/g, '')
      cb(null, `${id || 'file'}-${Date.now()}${safeExt}`)
    },
  }),
  limits: { fileSize: MAX_VIDEO, files: 1 },
})

const router = Router()

async function ensureUploadsDir() {
  await fs.mkdir(UPLOAD_ROOT, { recursive: true })
}

function publicSrc(row) {
  if (!row) return null
  if (row.source_type === 'url') return row.url
  if (row.source_type === 'file' && row.file_path) {
    return `/uploads/${path.basename(row.file_path)}`
  }
  return null
}

async function loadRows() {
  const { rows } = await query(`SELECT * FROM media_slots`)
  return rows
}

async function deleteStoredFile(row) {
  if (!row?.file_path) return
  const abs = path.join(UPLOAD_ROOT, path.basename(row.file_path))
  try {
    await fs.unlink(abs)
  } catch {
    /* already gone */
  }
}

function serialize(rows) {
  const defaults = getDefaultMap()
  const byId = Object.fromEntries(rows.map((row) => [row.id, row]))
  const urls = {}
  const media = { ...defaults }

  for (const [id, row] of Object.entries(byId)) {
    if (!SLOT_IDS.has(id)) continue
    const src = publicSrc(row)
    if (!src) continue
    media[id] = src
    if (row.source_type === 'url') urls[id] = row.url
  }

  return { media, urls }
}

router.get('/', async (_req, res, next) => {
  try {
    const rows = await loadRows()
    res.json(serialize(rows))
  } catch (err) {
    next(err)
  }
})

router.put('/:id/url', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params
    if (!SLOT_IDS.has(id)) {
      res.status(404).json({ error: 'Неизвестный слот' })
      return
    }
    const defaults = getDefaultMap()
    const trimmed = String(req.body?.url ?? '').trim()
    if (trimmed.startsWith('blob:')) {
      res.status(400).json({ error: 'Нельзя сохранить blob-URL' })
      return
    }
    if (!isAllowedMediaUrl(trimmed)) {
      res.status(400).json({ error: 'Разрешены только http(s) URL или путь вида /images/...' })
      return
    }

    const { rows: existing } = await query(`SELECT * FROM media_slots WHERE id = $1`, [
      id,
    ])
    const prev = existing[0]

    if (!trimmed || trimmed === defaults[id]) {
      await query(`DELETE FROM media_slots WHERE id = $1`, [id])
      await deleteStoredFile(prev)
    } else {
      await query(
        `INSERT INTO media_slots (id, source_type, url, file_path, mime_type, original_name, updated_at)
         VALUES ($1, 'url', $2, NULL, NULL, NULL, now())
         ON CONFLICT (id) DO UPDATE SET
           source_type = 'url',
           url = EXCLUDED.url,
           file_path = NULL,
           mime_type = NULL,
           original_name = NULL,
           updated_at = now()`,
        [id, trimmed],
      )
      await deleteStoredFile(prev)
    }

    res.json(serialize(await loadRows()))
  } catch (err) {
    next(err)
  }
})

router.post(
  '/:id/file',
  requireAuth,
  (req, res, next) => {
    ensureUploadsDir()
      .then(() => next())
      .catch(next)
  },
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? 'Файл слишком большой (макс. 120 МБ)'
            : err.message || 'Ошибка загрузки'
        res.status(400).json({ error: message })
        return
      }
      next()
    })
  },
  async (req, res, next) => {
    const file = req.file
    try {
      const { id } = req.params
      if (!SLOT_IDS.has(id)) {
        if (file) await fs.unlink(file.path).catch(() => {})
        res.status(404).json({ error: 'Неизвестный слот' })
        return
      }

      const slot = MEDIA_SLOTS.find((item) => item.id === id)
      if (!file) {
        res.status(400).json({ error: 'Файл не передан' })
        return
      }

      const isVideo = slot?.kind === 'video'
      const max = isVideo ? MAX_VIDEO : MAX_IMAGE
      if (file.size > max) {
        await fs.unlink(file.path).catch(() => {})
        res.status(400).json({
          error: isVideo
            ? 'Видео слишком большое (макс. 120 МБ)'
            : 'Изображение слишком большое (макс. 20 МБ)',
        })
        return
      }

      if (
        isVideo &&
        !file.mimetype.startsWith('video/') &&
        !/\.(mp4|webm|mov|m4v)$/i.test(file.originalname)
      ) {
        await fs.unlink(file.path).catch(() => {})
        res.status(400).json({ error: 'Нужен видеофайл' })
        return
      }
      if (
        !isVideo &&
        !file.mimetype.startsWith('image/') &&
        !/\.(jpe?g|png|webp|gif|avif)$/i.test(file.originalname)
      ) {
        await fs.unlink(file.path).catch(() => {})
        res.status(400).json({ error: 'Нужен файл изображения' })
        return
      }

      const { rows: existing } = await query(`SELECT * FROM media_slots WHERE id = $1`, [
        id,
      ])
      const prev = existing[0]
      const relative = path.basename(file.filename)

      await query(
        `INSERT INTO media_slots (id, source_type, url, file_path, mime_type, original_name, updated_at)
         VALUES ($1, 'file', NULL, $2, $3, $4, now())
         ON CONFLICT (id) DO UPDATE SET
           source_type = 'file',
           url = NULL,
           file_path = EXCLUDED.file_path,
           mime_type = EXCLUDED.mime_type,
           original_name = EXCLUDED.original_name,
           updated_at = now()`,
        [id, relative, file.mimetype || null, file.originalname || null],
      )

      await deleteStoredFile(prev)
      res.json(serialize(await loadRows()))
    } catch (err) {
      if (file?.path) await fs.unlink(file.path).catch(() => {})
      next(err)
    }
  },
)

router.delete('/', requireAuth, async (_req, res, next) => {
  try {
    const rows = await loadRows()
    await query(`DELETE FROM media_slots`)
    for (const row of rows) await deleteStoredFile(row)
    res.json(serialize([]))
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params
    if (!SLOT_IDS.has(id)) {
      res.status(404).json({ error: 'Неизвестный слот' })
      return
    }
    const { rows } = await query(`SELECT * FROM media_slots WHERE id = $1`, [id])
    await query(`DELETE FROM media_slots WHERE id = $1`, [id])
    await deleteStoredFile(rows[0])
    res.json(serialize(await loadRows()))
  } catch (err) {
    next(err)
  }
})

export { UPLOAD_ROOT, ensureUploadsDir }
export default router
