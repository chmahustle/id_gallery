import { editableFields } from './editable'

/** Атрибут, которым помечены тексты и фото из реестра */
export const FIELD_ATTR = 'data-idg-edit'

const norm = (value: string) => value.replace(/\s+/g, ' ').trim()

/**
 * Пометить внутри root элементы, совпадающие с полями группы:
 * фото — по адресу картинки, текст — самый глубокий элемент с тем же текстом.
 * Возвращает id найденных полей.
 */
export function clearFields(root: ParentNode) {
  root.querySelectorAll(`[${FIELD_ATTR}]`).forEach((el) => {
    el.removeAttribute(FIELD_ATTR)
    el.removeAttribute('title')
  })
}

/**
 * block — имя блока (главная, услуги): ищутся только поля этого блока,
 * чтобы одинаковые тексты и фото в соседних блоках не путались.
 */
export function markFields(root: ParentNode, group: string, block?: string): string[] {
  if (!block) clearFields(root)
  const found = new Set<string>()
  if (!group) return []
  const fields = editableFields.filter(
    (field) => field.group === group && !field.seo && (!block || field.block === block),
  )
  const textNodes = [
    ...root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,p,span,a,li,div,em,strong,button'),
  ]

  for (const field of fields) {
    const raw = field.get()
    /* кнопка: на странице видно её текст */
    let value = norm(raw)
    if (field.kind === 'link') {
      try {
        value = norm(String(JSON.parse(raw).label || ''))
      } catch {
        value = ''
      }
    }
    if (!value) continue
    if (field.kind === 'image') {
      root.querySelectorAll('img').forEach((img) => {
        if (img.getAttribute('src') === raw) {
          img.setAttribute(FIELD_ATTR, field.id)
          img.setAttribute('title', field.label)
          found.add(field.id)
        }
      })
      continue
    }
    const matches = textNodes.filter((el) => norm(el.textContent || '') === value)
    for (const el of matches) {
      if (matches.some((other) => other !== el && el.contains(other))) continue
      el.setAttribute(FIELD_ATTR, field.id)
      el.setAttribute('title', field.label)
      found.add(field.id)
    }
  }
  return [...found]
}
