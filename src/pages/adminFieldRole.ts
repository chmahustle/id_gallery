import type { EditableField } from '../content/editable'

/**
 * Роль поля для окна настроек: заголовок, подзаголовок, текст или фото.
 * Метка «Первый экран — заголовок» → роль «Заголовок», место «Первый экран».
 */
export type FieldRole = 'image' | 'link' | 'subtitle' | 'title' | 'text'

export function fieldRole(field: Pick<EditableField, 'label' | 'kind' | 'extra' | 'seo'>): {
  role: FieldRole
  name: string
  place: string
} {
  const [prefix, suffix = prefix] = field.label.split(' — ')
  const tail = suffix.toLowerCase()
  const role: FieldRole =
    field.kind === 'image'
      ? 'image'
      : field.kind === 'link'
        ? 'link'
        : tail.includes('подзаголовок')
          ? 'subtitle'
          : tail.includes('заголовок')
            ? 'title'
            : 'text'
  const name = suffix.charAt(0).toUpperCase() + suffix.slice(1)
  /* место нужно, когда в блоке несколько похожих полей (направления, этапы, карточки) */
  const place =
    (field.extra || field.seo || /\d/.test(prefix) || prefix.includes('«')) && prefix !== suffix
      ? prefix
      : ''
  return { role, name, place }
}
