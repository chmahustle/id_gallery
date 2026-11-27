import type { z } from 'zod'
import { Router } from 'express'
import { SESSION_COOKIE, isValidSession, requireAuth } from './auth.js'
import { query } from './db.js'
import {
  MAX_RECORD_JSON,
  SLUG_RE,
  firstIssue,
  productDataSchema,
  recordBodySchema,
} from '../src/content/schemas.ts'
import { priceRanks } from '../src/lib/price.ts'

/**
 * Товары из админки. data — объект товара в формате сайта (тип Product).
 * Публичный список отдаёт и скрытые (published=false), чтобы сайт мог
 * скрыть товар из кода с тем же slug.
 */
type RecordRow = { slug: string; published: boolean; data: Record<string, unknown> }

const router = Router()

function rowToItem(row: RecordRow) {
  return { slug: row.slug, published: Boolean(row.published), data: row.data }
}

const bodySchema = recordBodySchema(productDataSchema)

/** Проверка товара по общей схеме; ошибка — текст для ответа 400 */
function validate(
  slug: string,
  body: unknown,
): { error: string; value?: undefined } | { error?: undefined; value: z.infer<typeof bodySchema> } {
  if (!SLUG_RE.test(slug)) return { error: 'Адрес товара: латиница, цифры и дефис' }
  const data = (body as { data?: unknown } | undefined)?.data
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { error: 'Нет данных товара' }
  }
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return { error: firstIssue(parsed.error) }
  if (JSON.stringify(parsed.data.data).length > MAX_RECORD_JSON) {
    return { error: 'Слишком большая карточка' }
  }
  return { value: parsed.data }
}

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(`SELECT slug, published, data FROM products ORDER BY created_at`)
    /*
     * Цены на сайте не показываются: посетителям API отдаёт вместо цены
     * только её место по возрастанию (priceRank) — для сортировки каталога.
     */
    const admin = await isValidSession(req.cookies?.[SESSION_COOKIE])
    const items = rows.map(rowToItem)
    const ranks = priceRanks(items.map((item) => item.data?.price))
    items.forEach((item, index) => {
      if (!item.data || typeof item.data !== 'object') return
      delete item.data.priceRank
      if (admin) return
      delete item.data.price
      const rank = ranks[index]
      if (rank != null) item.data.priceRank = rank
    })
    res.json({ items })
  } catch (err) {
    next(err)
  }
})

router.put('/:slug', requireAuth, async (req, res, next) => {
  try {
    const slug = String(req.params.slug)
    const { error, value } = validate(slug, req.body)
    if (error || !value) {
      res.status(400).json({ error })
      return
    }
    const data = value.data
    const published = value.published !== false
    const { rows } = await query(
      `INSERT INTO products (slug, data, published, updated_at) VALUES ($1, $2, $3, now())
       ON CONFLICT (slug) DO UPDATE SET data = EXCLUDED.data, published = EXCLUDED.published, updated_at = now()
       RETURNING slug, published, data`,
      [slug, { ...data, slug }, published],
    )
    res.json({ item: rowToItem(rows[0]) })
  } catch (err) {
    next(err)
  }
})

router.delete('/:slug', requireAuth, async (req, res, next) => {
  try {
    await query(`DELETE FROM products WHERE slug = $1`, [String(req.params.slug)])
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
