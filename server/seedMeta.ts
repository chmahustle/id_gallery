import type { PoolClient } from 'pg'
import { HttpError } from './httpError.js'
import { pool } from './db.js'

/**
 * Одноразовый сид: после первого успешного прогона флаг остаётся,
 * даже если админ удалил все строки (пустая таблица ≠ «ещё не сидили»).
 */
export async function runOnceSeed(metaKey: string, seedFn: (client: PoolClient) => Promise<void>) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows } = await client.query(`SELECT value FROM app_meta WHERE key = $1 FOR UPDATE`, [
      metaKey,
    ])
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

export function uniqueViolation(err: unknown, message: string) {
  if ((err as { code?: string })?.code === '23505') return new HttpError(409, message)
  return err
}
