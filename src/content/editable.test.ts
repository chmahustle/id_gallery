import { describe, expect, it } from 'vitest'
import { editableFields } from './editable'

/*
 * Фото страниц (src/data, кроме самих товаров, брендов, интерьеров и шоурумов —
 * у них свои вкладки в админке) должны меняться во вкладке «Тексты и фото».
 */
const pageData = import.meta.glob(
  [
    '../data/*.ts',
    '!../data/index.ts',
    '!../data/*Runtime.ts',
    '!../data/*.test.ts',
    '!../data/products.ts',
    '!../data/demo*.ts',
  ],
  { eager: true },
)
/* списки, которые правятся своими вкладками, а не «Текстами и фото» */
const OWN_EDITORS = new Set(['brands.ts:brands', 'interiors.ts:interiors', 'showrooms.ts:showrooms'])

function photoPaths(value: unknown, path: string, out: Map<string, string>, depth = 0) {
  if (depth > 8 || value == null || typeof value === 'function') return
  if (typeof value === 'string') {
    if (/^\/(placeholders|images|uploads)\/\S+$/.test(value)) out.set(path, value)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => photoPaths(item, `${path}[${i}]`, out, depth + 1))
    return
  }
  if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (key === 'srcSet') continue
      photoPaths(item, `${path}.${key}`, out, depth + 1)
    }
  }
}

describe('«Тексты и фото»', () => {
  it('каждое фото страниц можно заменить в админке', () => {
    const images = editableFields.filter((field) => field.kind === 'image')
    const saved = images.map((field) => field.get())
    /* метка в каждое поле: где метки нет — фото не связано с админкой */
    images.forEach((field, i) => field.apply(`__field${i}`))
    const missing = new Map<string, string>()
    try {
      for (const [file, mod] of Object.entries(pageData)) {
        for (const [name, value] of Object.entries(mod as Record<string, unknown>)) {
          const key = `${file.replace('../data/', '')}:${name}`
          if (!OWN_EDITORS.has(key)) photoPaths(value, key, missing)
        }
      }
    } finally {
      images.forEach((field, i) => field.apply(saved[i]!))
    }
    expect([...missing.keys()]).toEqual([])
  })
})
