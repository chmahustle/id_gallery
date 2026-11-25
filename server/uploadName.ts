import crypto from 'node:crypto'

/**
 * Расширение загруженного файла — только по его типу из белого списка,
 * а не по имени: файл «x.html» с типом image/png не станет страницей сайта.
 */
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'application/pdf': '.pdf',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
}

export function extensionFor(mimetype: string | undefined) {
  return EXT_BY_TYPE[String(mimetype || '').toLowerCase()] || ''
}

export function isAllowedType(
  mimetype: string | undefined,
  kinds: Array<'image' | 'video' | 'pdf'> = ['image'],
) {
  const ext = extensionFor(mimetype)
  if (!ext) return false
  const type = String(mimetype).toLowerCase()
  return kinds.some((kind) =>
    kind === 'pdf' ? type === 'application/pdf' : type.startsWith(`${kind}/`),
  )
}

/** Имя файла на диске: префикс, время, случайная часть, расширение по типу */
export function storedName(prefix: string | undefined, mimetype: string | undefined) {
  const safePrefix = String(prefix || 'file').replace(/[^a-zA-Z0-9_-]/g, '') || 'file'
  return `${safePrefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extensionFor(mimetype)}`
}
