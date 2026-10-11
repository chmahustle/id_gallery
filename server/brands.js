import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { brandLogos as defaultBrands } from '../src/content.js'
import { requireAuth } from './auth.js'
import { query } from './db.js'
import { UPLOAD_ROOT, ensureUploadsDir } from './media.js'
import { isAllowedMediaUrl } from './mediaUrl.js'
import { runOnceSeed, uniqueViolation } from './seedMeta.js'

const MAX_IMAGE = 20 * 1024 * 1024

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').slice(0, 16) || ''
      const safeExt = /^\.[a-z0-9]+$/i.test(ext) ? ext.toLowerCase() : '.jpg'
      cb(null, `brand-${Date.now()}${safeExt}`)
    },
  }),
  limits: { fileSize: MAX_IMAGE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (String(file.mimetype || '').startsWith('image/')) {
      cb(null, true)
      return
    }
    cb(new Error('Можно загружать только изображения'))
  },
})

const router = Router()

function isAllowedWebsite(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return true
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function rowToBrand(row) {
  return {
    id: row.id,
    name: row.name,
    filter: row.filter_name,
    logo: row.logo || null,
    website: row.website || null,
    sortOrder: row.sort_order,
    published: Boolean(row.published),
  }
}

async function ensureSeeded() {
  await runOnceSeed('brands_seeded', async (client) => {
    for (let i = 0; i < defaultBrands.length; i += 1) {
      const item = defaultBrands[i]
      await client.query(
        `INSERT INTO brands (name, filter_name, logo, website, sort_order, published)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (name) DO NOTHING`,
        [
          item.name,
          item.filter || item.name,
          item.logo || '',
          item.website || '',
          i,
        ],
      )
    }
  })
}

function normalizePayload(body) {
  const name = String(body?.name ?? '').trim()
  const filter = String(body?.filter ?? body?.filter_name ?? '').trim() || name
  const logo = String(body?.logo ?? '').trim()
  const website = String(body?.website ?? '').trim()
  const sortOrder = Number(body?.sortOrder ?? body?.sort_order)
  const published =
    body?.published === undefined ? true : Boolean(body.published)

  if (!name) {
    const err = new Error('Укажите название бренда')
    err.status = 400
    throw err
  }
  if (logo && !isAllowedMediaUrl(logo)) {
    const err = new Error('Некорректный URL логотипа')
    err.status = 400
    throw err
  }
  if (website && !isAllowedWebsite(website)) {
    const err = new Error('Сайт должен начинаться с http:// или https://')
    err.status = 400
    throw err
  }

  return {
    name,
    filter,
    logo,
    website,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    published,
  }
}

router.get('/', async (_req, res, next) => {
  try {
    await ensureSeeded()
    const { rows } = await query(
      `SELECT * FROM brands
       WHERE published = true
       ORDER BY sort_order ASC, id ASC`,
    )
    res.json({ items: rows.map(rowToBrand) })
  } catch (err) {
    next(err)
  }
})

router.get('/admin', requireAuth, async (_req, res, next) => {
  try {
    await ensureSeeded()
    const { rows } = await query(
      `SELECT * FROM brands ORDER BY sort_order ASC, id ASC`,
    )
    res.json({ items: rows.map(rowToBrand) })
  } catch (err) {
    next(err)
  }
})

router.post('/upload', requireAuth, (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      err.status = err.status || 400
      next(err)
      return
    }
    try {
      await ensureUploadsDir()
      if (!req.file) {
        res.status(400).json({ error: 'Файл не получен' })
        return
      }
      res.json({ url: `/uploads/${path.basename(req.file.filename)}` })
    } catch (error) {
      next(error)
    }
  })
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = normalizePayload(req.body)

    let sortOrder = data.sortOrder
    if (req.body?.sortOrder === undefined && req.body?.sort_order === undefined) {
      const { rows } = await query(
        `SELECT COALESCE(MAX(sort_order), -1)::int AS max FROM brands`,
      )
      sortOrder = (rows[0]?.max ?? -1) + 1
    }

    const { rows } = await query(
      `INSERT INTO brands (name, filter_name, logo, website, sort_order, published)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.name,
        data.filter,
        data.logo,
        data.website,
        sortOrder,
        data.published,
      ],
    )
    res.status(201).json({ item: rowToBrand(rows[0]) })
  } catch (err) {
    next(uniqueViolation(err, 'Бренд с таким названием уже есть'))
  }
})

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Некорректный id' })
      return
    }
    const current = await query(`SELECT * FROM brands WHERE id = $1`, [id])
    if (!current.rows[0]) {
      res.status(404).json({ error: 'Бренд не найден' })
      return
    }
    const prev = rowToBrand(current.rows[0])
    const data = normalizePayload({
      name: req.body?.name ?? prev.name,
      filter: req.body?.filter ?? prev.filter,
      logo: req.body?.logo !== undefined ? req.body.logo : prev.logo || '',
      website:
        req.body?.website !== undefined ? req.body.website : prev.website || '',
      sortOrder:
        req.body?.sortOrder !== undefined
          ? req.body.sortOrder
          : prev.sortOrder,
      published:
        req.body?.published !== undefined
          ? req.body.published
          : prev.published,
    })

    const { rows } = await query(
      `UPDATE brands SET
        name = $1, filter_name = $2, logo = $3, website = $4,
        sort_order = $5, published = $6, updated_at = now()
       WHERE id = $7
       RETURNING *`,
      [
        data.name,
        data.filter,
        data.logo,
        data.website,
        data.sortOrder,
        data.published,
        id,
      ],
    )
    res.json({ item: rowToBrand(rows[0]) })
  } catch (err) {
    next(uniqueViolation(err, 'Бренд с таким названием уже есть'))
  }
})

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Некорректный id' })
      return
    }
    const { rowCount } = await query(`DELETE FROM brands WHERE id = $1`, [id])
    if (!rowCount) {
      res.status(404).json({ error: 'Бренд не найден' })
      return
    }
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
