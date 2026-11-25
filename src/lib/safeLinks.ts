/**
 * Защита ссылок из админки: адреса вида «javascript:…» или «data:text/html…»
 * выполняют код при нажатии. Такие значения убираются из любых данных
 * (тексты, кнопки, меню, товары, бренды) до отрисовки сайта.
 */
const UNSAFE = /^\s*(javascript|vbscript|data\s*:\s*text\/html)\s*:?/i

/* браузер пропускает управляющие символы в адресе («java\tscript:») — их тоже убираем */
const clean = (text: string) =>
  // eslint-disable-next-line no-control-regex
  !UNSAFE.test(text.replace(/[\u0000-\u001f]/g, ''))

export function scrubUnsafe<T>(value: T): T {
  if (typeof value === 'string') return (clean(value) ? value : '') as T
  if (Array.isArray(value)) return value.map((item) => scrubUnsafe(item)) as T
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, scrubUnsafe(item)]),
    ) as T
  }
  return value
}

/** Значения правок: строки и JSON внутри строк (списки, кнопки) */
export function scrubContentValues(values: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, raw] of Object.entries(values)) {
    if (typeof raw !== 'string') continue
    const trimmed = raw.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        result[key] = JSON.stringify(scrubUnsafe(JSON.parse(trimmed)))
        continue
      } catch {
        /* не JSON — обычная строка */
      }
    }
    result[key] = scrubUnsafe(raw)
  }
  return result
}
