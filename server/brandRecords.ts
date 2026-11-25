import { Router } from 'express'
import { requireAuth } from './auth.js'
import { query } from './db.js'
import {
  MAX_RECORD_JSON,
  SLUG_RE,
  brandDataSchema,
  firstIssue,
  recordBodySchema,
} from '../src/content/schemas.ts'

/**
 * Бренды из админки: data — поля бренда в формате сайта (тип Brand)
 * плюс подборка товаров (featuredSlugs) и интерьеры (interiorSlugs).
 */
type RecordRow = { slug: string; published: boolean; data: Record<string, unknown> }

const bodySchema = recordBodySchema(brandDataSchema)

const router = Router()

const rowToItem = (row: RecordRow) => ({
  slug: row.slug,
  published: Boolean(row.published),
  data: row.data,
})

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT slug, published, data FROM brand_records ORDER BY created_at`,
    )
    res.json({ items: rows.map(rowToItem) })
  } catch (err) {
    next(err)
  }
})

router.put('/:slug', requireAuth, async (req, res, next) => {
  try {
    const slug = String(req.params.slug)
    if (!SLUG_RE.test(slug)) {
      res.status(400).json({ error: 'Адрес бренда: латиница, цифры и дефис' })
      return
    }
    if (!req.body?.data || typeof req.body.data !== 'object' || Array.isArray(req.body.data)) {
      res.status(400).json({ error: 'Нет данных бренда' })
      return
    }
    const parsed = bodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: firstIssue(parsed.error) })
      return
    }
    const data = parsed.data.data
    if (JSON.stringify(data).length > MAX_RECORD_JSON) {
      res.status(400).json({ error: 'Слишком много данных' })
      return
    }
    const { rows } = await query(
      `INSERT INTO brand_records (slug, data, published, updated_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data, published = EXCLUDED.published, updated_at = now()
       RETURNING slug, published, data`,
      [slug, { ...data, slug }, parsed.data.published !== false],
    )
    res.json({ item: rowToItem(rows[0]) })
  } catch (err) {
    next(err)
  }
})

router.delete('/:slug', requireAuth, async (req, res, next) => {
  try {
    await query(`DELETE FROM brand_records WHERE slug = $1`, [String(req.params.slug)])
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
