import { Router } from 'express'
import { getDefaultTextMap, normalizeTextValue } from '../src/content/textDefaults.js'
import { requireAuth } from './auth.js'
import { pool, query } from './db.js'

const router = Router()

async function loadOverrides() {
  const defaults = getDefaultTextMap()
  const { rows } = await query(`SELECT id, value FROM site_texts`)
  return Object.fromEntries(
    rows
      .filter((row) => row.id in defaults && typeof row.value === 'string')
      .map((row) => [row.id, row.value]),
  )
}

router.get('/', async (_req, res, next) => {
  try {
    const overrides = await loadOverrides()
    res.json({ overrides })
  } catch (err) {
    next(err)
  }
})

router.put('/', requireAuth, async (req, res, next) => {
  try {
    const defaults = getDefaultTextMap()
    const patch = req.body?.texts
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
      res.status(400).json({ error: 'Ожидается объект texts' })
      return
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (const [id, value] of Object.entries(patch)) {
        if (!(id in defaults)) continue
        const normalized = normalizeTextValue(id, value)
        if (normalized === defaults[id]) {
          await client.query(`DELETE FROM site_texts WHERE id = $1`, [id])
        } else {
          await client.query(
            `INSERT INTO site_texts (id, value, updated_at)
             VALUES ($1, $2, now())
             ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
            [id, normalized],
          )
        }
      }
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }

    res.json({ overrides: await loadOverrides() })
  } catch (err) {
    next(err)
  }
})

router.delete('/', requireAuth, async (_req, res, next) => {
  try {
    await query(`DELETE FROM site_texts`)
    res.json({ overrides: {} })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const defaults = getDefaultTextMap()
    if (!(req.params.id in defaults)) {
      res.status(404).json({ error: 'Неизвестное поле' })
      return
    }
    await query(`DELETE FROM site_texts WHERE id = $1`, [req.params.id])
    res.json({ overrides: await loadOverrides() })
  } catch (err) {
    next(err)
  }
})

export default router
