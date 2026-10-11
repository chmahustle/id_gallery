import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { news as defaultNews } from '../src/content.js'
import { requireAuth } from './auth.js'
import { query } from './db.js'
import { UPLOAD_ROOT, ensureUploadsDir } from './media.js'
import {
  isAllowedHttpUrl,
  isAllowedLinkUrl,
  isAllowedMediaUrl,
} from './mediaUrl.js'
import { runOnceSeed, uniqueViolation } from './seedMeta.js'

const MAX_IMAGE = 20 * 1024 * 1024

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || '').slice(0, 16) || ''
      const safeExt = /^\.[a-z0-9]+$/i.test(ext) ? ext.toLowerCase() : '.jpg'
      cb(null, `news-${Date.now()}${safeExt}`)
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

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

function parseRuDate(value) {
  const match = String(value || '').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const dt = new Date(Date.UTC(year, month - 1, day))
  if (
    dt.getUTCFullYear() !== year ||
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day
  ) {
    return null
  }
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isoToRu(iso) {
  if (!iso) return ''
  const raw = String(iso).slice(0, 10)
  const [y, m, d] = raw.split('-')
  if (!y || !m || !d) return ''
  return `${d}.${m}.${y}`
}

function parseJsonArray(raw, fallback = []) {
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function rowToArticle(row) {
  const images = parseJsonArray(row.images_json)
  const body = parseJsonArray(row.body_json)
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    date: row.date,
    category: row.category,
    excerpt: row.excerpt,
    image: row.image || images[0]?.src || '',
    images: images.length
      ? images
      : row.image
        ? [{ src: row.image, caption: row.title }]
        : [],
    body: body.filter((p) => typeof p === 'string' && p.trim()),
    ctaLabel: row.cta_label || null,
    ctaHref: row.cta_href || null,
    externalUrl: row.external_url || null,
    videoUrl: row.video_url || null,
    published: Boolean(row.published),
  }
}

async function ensureSeeded() {
  await runOnceSeed('news_seeded', async (client) => {
    for (const item of defaultNews) {
      await client.query(
        `INSERT INTO news_articles (
          slug, title, date, category, excerpt, image, images_json, body_json,
          cta_label, cta_href, external_url, video_url, published, sort_date
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,$13)
        ON CONFLICT (slug) DO NOTHING`,
        [
          item.slug,
          item.title,
          item.date,
          item.category,
          item.excerpt,
          item.image || '',
          JSON.stringify(item.images || []),
          JSON.stringify(item.body || []),
          item.ctaLabel || null,
          item.ctaHref || null,
          item.externalUrl || null,
          item.videoUrl || null,
          parseRuDate(item.date),
        ],
      )
    }
  })
}

function normalizePayload(body, { partial = false } = {}) {
  const title = String(body?.title ?? '').trim()
  const date = String(body?.date ?? '').trim()
  const category = String(body?.category ?? '').trim() || 'События'
  const excerpt = String(body?.excerpt ?? '').trim()
  let image = String(body?.image ?? '').trim()
  const slugRaw = String(body?.slug ?? '').trim()
  const slug = slugify(slugRaw || title)

  let images = body?.images
  if (typeof images === 'string') {
    images = images
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((src) => ({ src, caption: '' }))
  }
  if (!Array.isArray(images)) images = []
  images = images
    .map((item) => {
      if (typeof item === 'string') return { src: item.trim(), caption: '' }
      return {
        src: String(item?.src || '').trim(),
        caption: String(item?.caption || '').trim(),
      }
    })
    .filter((item) => item.src)

  let paragraphs = body?.body
  if (typeof paragraphs === 'string') {
    paragraphs = paragraphs
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
  }
  if (!Array.isArray(paragraphs)) paragraphs = []
  paragraphs = paragraphs.map((p) => String(p || '').trim()).filter(Boolean)

  if (!image && images[0]?.src) image = images[0].src
  if (image && !images.length) images = [{ src: image, caption: title }]

  const ctaLabel = String(body?.ctaLabel ?? body?.cta_label ?? '').trim() || null
  const ctaHref = String(body?.ctaHref ?? body?.cta_href ?? '').trim() || null
  const externalUrl =
    String(body?.externalUrl ?? body?.external_url ?? '').trim() || null
  const videoUrl = String(body?.videoUrl ?? body?.video_url ?? '').trim() || null
  const published =
    body?.published === undefined ? true : Boolean(body.published)

  if (!partial) {
    if (!title) {
      const err = new Error('Укажите заголовок')
      err.status = 400
      throw err
    }
    if (!slug) {
      const err = new Error('Не удалось сформировать slug')
      err.status = 400
      throw err
    }
    if (!date || !parseRuDate(date)) {
      const err = new Error('Укажите корректную дату ДД.ММ.ГГГГ')
      err.status = 400
      throw err
    }
    if (!paragraphs.length) {
      const err = new Error('Добавьте текст новости')
      err.status = 400
      throw err
    }
    if (image && !isAllowedMediaUrl(image)) {
      const err = new Error('Некорректный URL обложки')
      err.status = 400
      throw err
    }
    for (const photo of images) {
      if (!isAllowedMediaUrl(photo.src)) {
        const err = new Error('Некорректный URL в галерее')
        err.status = 400
        throw err
      }
    }
    if (ctaHref && !isAllowedLinkUrl(ctaHref)) {
      const err = new Error('Некорректная ссылка кнопки')
      err.status = 400
      throw err
    }
    if (externalUrl && !isAllowedHttpUrl(externalUrl)) {
      const err = new Error('Внешняя ссылка должна быть http(s)')
      err.status = 400
      throw err
    }
    if (videoUrl && !isAllowedHttpUrl(videoUrl)) {
      const err = new Error('Видео URL должен быть http(s)')
      err.status = 400
      throw err
    }
  }

  return {
    slug,
    title,
    date,
    category,
    excerpt,
    image,
    images,
    body: paragraphs,
    ctaLabel,
    ctaHref,
    externalUrl,
    videoUrl,
    published,
    sortDate: parseRuDate(date),
  }
}

router.get('/', async (_req, res, next) => {
  try {
    await ensureSeeded()
    const { rows } = await query(
      `SELECT * FROM news_articles
       WHERE published = true
       ORDER BY sort_date DESC NULLS LAST, id DESC`,
    )
    res.json({ items: rows.map(rowToArticle) })
  } catch (err) {
    next(err)
  }
})

router.get('/admin', requireAuth, async (_req, res, next) => {
  try {
    await ensureSeeded()
    const { rows } = await query(
      `SELECT * FROM news_articles
       ORDER BY sort_date DESC NULLS LAST, id DESC`,
    )
    res.json({ items: rows.map(rowToArticle) })
  } catch (err) {
    next(err)
  }
})

router.get('/:slug', async (req, res, next) => {
  try {
    await ensureSeeded()
    const { rows } = await query(
      `SELECT * FROM news_articles WHERE slug = $1 AND published = true LIMIT 1`,
      [req.params.slug],
    )
    if (!rows[0]) {
      res.status(404).json({ error: 'Новость не найдена' })
      return
    }
    res.json({ item: rowToArticle(rows[0]) })
  } catch (err) {
    next(err)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = normalizePayload(req.body)
    const { rows } = await query(
      `INSERT INTO news_articles (
        slug, title, date, category, excerpt, image, images_json, body_json,
        cta_label, cta_href, external_url, video_url, published, sort_date
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *`,
      [
        data.slug,
        data.title,
        data.date,
        data.category,
        data.excerpt,
        data.image,
        JSON.stringify(data.images),
        JSON.stringify(data.body),
        data.ctaLabel,
        data.ctaHref,
        data.externalUrl,
        data.videoUrl,
        data.published,
        data.sortDate,
      ],
    )
    res.status(201).json({ item: rowToArticle(rows[0]) })
  } catch (err) {
    next(uniqueViolation(err, 'Новость с таким slug уже есть'))
  }
})

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Некорректный id' })
      return
    }
    const current = await query(`SELECT * FROM news_articles WHERE id = $1`, [id])
    if (!current.rows[0]) {
      res.status(404).json({ error: 'Новость не найдена' })
      return
    }
    const data = normalizePayload({
      ...rowToArticle(current.rows[0]),
      ...req.body,
      slug: req.body?.slug ?? current.rows[0].slug,
      ctaLabel: req.body?.ctaLabel ?? current.rows[0].cta_label,
      ctaHref: req.body?.ctaHref ?? current.rows[0].cta_href,
      externalUrl: req.body?.externalUrl ?? current.rows[0].external_url,
      videoUrl: req.body?.videoUrl ?? current.rows[0].video_url,
      published:
        req.body?.published !== undefined
          ? req.body.published
          : current.rows[0].published,
    })

    const { rows } = await query(
      `UPDATE news_articles SET
        slug = $1, title = $2, date = $3, category = $4, excerpt = $5,
        image = $6, images_json = $7, body_json = $8,
        cta_label = $9, cta_href = $10, external_url = $11, video_url = $12,
        published = $13, sort_date = $14, updated_at = now()
       WHERE id = $15
       RETURNING *`,
      [
        data.slug,
        data.title,
        data.date,
        data.category,
        data.excerpt,
        data.image,
        JSON.stringify(data.images),
        JSON.stringify(data.body),
        data.ctaLabel,
        data.ctaHref,
        data.externalUrl,
        data.videoUrl,
        data.published,
        data.sortDate,
        id,
      ],
    )
    res.json({ item: rowToArticle(rows[0]) })
  } catch (err) {
    next(uniqueViolation(err, 'Новость с таким slug уже есть'))
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

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: 'Некорректный id' })
      return
    }
    const { rowCount } = await query(`DELETE FROM news_articles WHERE id = $1`, [
      id,
    ])
    if (!rowCount) {
      res.status(404).json({ error: 'Новость не найдена' })
      return
    }
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export { isoToRu, slugify }
export default router
