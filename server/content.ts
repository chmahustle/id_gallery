import { Router } from 'express'
import { requireAuth } from './auth.js'
import { query } from './db.js'
import { CONTENT_ID_RE, contentBodySchema, firstIssue } from '../src/content/schemas.ts'

/**
 * Правки текстов и фото текущих страниц. Список полей — в реестре
 * src/content/editable.ts; сервер хранит только пары id → значение.
 */

const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(`SELECT id, value FROM content_overrides`)
    res.json({ values: Object.fromEntries(rows.map((row) => [row.id, row.value])) })
  } catch (err) {
    next(err)
  }
})

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id)
    if (!CONTENT_ID_RE.test(id)) {
      res.status(400).json({ error: 'Неверное поле' })
      return
    }
    const parsed = contentBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: firstIssue(parsed.error) })
      return
    }
    const { value } = parsed.data
    await query(
      `INSERT INTO content_overrides (id, value, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
      [id, value],
    )
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const id = String(req.params.id)
    if (!CONTENT_ID_RE.test(id)) {
      res.status(400).json({ error: 'Неверное поле' })
      return
    }
    await query(`DELETE FROM content_overrides WHERE id = $1`, [id])
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
