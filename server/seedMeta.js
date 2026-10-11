import { pool } from './db.js'

/**
 * Одноразовый сид: после первого успешного прогона флаг остаётся,
 * даже если админ удалил все строки (пустая таблица ≠ «ещё не сидили»).
 */
export async function runOnceSeed(metaKey, seedFn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(
      `SELECT value FROM app_meta WHERE key = $1 FOR UPDATE`,
      [metaKey],
    )
    if (rows[0]?.value === '1') {
      await client.query('COMMIT')
      return false
    }
    await seedFn(client)
    await client.query(
      `INSERT INTO app_meta (key, value, updated_at)
       VALUES ($1, '1', now())
       ON CONFLICT (key) DO UPDATE SET value = '1', updated_at = now()`,
      [metaKey],
    )
    await client.query('COMMIT')
    return true
  } catch (err) {
    try {
      await client.query('ROLLBACK')
    } catch {
      /* ignore */
    }
    throw err
  } finally {
    client.release()
  }
}

export function uniqueViolation(err, message) {
  if (err?.code === '23505') {
    const next = new Error(message)
    next.status = 409
    return next
  }
  return err
}
