/** Разрешены только http(s) и локальные пути вида /images/... */
export function isAllowedMediaUrl(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return true
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return false
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return !trimmed.includes('\\') && !trimmed.includes('\0')
  }
  return isAllowedHttpUrl(trimmed)
}

/** Только http(s) — для сайтов, embed и внешних ссылок */
export function isAllowedHttpUrl(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return true
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Внутренний путь /… или http(s) */
export function isAllowedLinkUrl(value) {
  const trimmed = String(value ?? '').trim()
  if (!trimmed) return true
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return !trimmed.includes('\\') && !trimmed.includes('\0')
  }
  return isAllowedHttpUrl(trimmed)
}
