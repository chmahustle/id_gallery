import { useEffect, useState } from 'react'
import { api } from '../api'
import { explainError } from './adminUpload'

/**
 * Список, который хранится одной записью в правках контента (JSON):
 * вакансии, интерьеры, меню. Загрузка, черновик и сохранение.
 * initial() — значение из кода, если в базе ещё ничего нет.
 */
export type AdminMessage = { ok?: string; error?: string }

type StoredListOptions<T> = {
  onMessage: (message: AdminMessage) => void
  onSaved?: (value: T | null) => void
  okText: string
}

export function useStoredList<T>(
  key: string,
  initial: () => T,
  { onMessage, onSaved, okText }: StoredListOptions<T>,
) {
  const [list, setList] = useState<T | null>(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let alive = true
    api<{ values?: Record<string, string> }>('/api/content')
      .then((data) => {
        if (!alive) return
        let saved: T | null = null
        try {
          const raw = data.values?.[key]
          saved = raw ? (JSON.parse(raw) as T) : null
        } catch {
          saved = null
        }
        setList(saved ?? initial())
      })
      .catch((err) => onMessage({ error: explainError(err, 'Не удалось загрузить данные') }))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- один раз на ключ
  }, [key])

  function change(next: T | ((current: T | null) => T)) {
    setList(typeof next === 'function' ? (next as (current: T | null) => T)(list) : next)
    setDirty(true)
  }

  async function save(value: T | null = list) {
    setBusy(true)
    try {
      await api(`/api/content/${encodeURIComponent(key)}`, {
        method: 'PUT',
        body: JSON.stringify({ value: JSON.stringify(value) }),
      })
      setList(value)
      setDirty(false)
      onSaved?.(value)
      onMessage({ ok: okText })
      return true
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить') })
      return false
    } finally {
      setBusy(false)
    }
  }

  async function reset(fallback?: T) {
    setBusy(true)
    try {
      await api(`/api/content/${encodeURIComponent(key)}`, { method: 'DELETE' })
      const value = fallback ?? initial()
      setList(value)
      setDirty(false)
      onSaved?.(null)
      onMessage({ ok: 'Возвращено исходное' })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сбросить') })
    } finally {
      setBusy(false)
    }
  }

  return { list, change, dirty, busy, save, reset }
}

export function moved<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta
  if (target < 0 || target >= list.length) return list
  const next = [...list]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}
