import { describe, expect, it } from 'vitest'
import {
  brandDataSchema,
  contentBodySchema,
  firstIssue,
  productDataSchema,
  recordBodySchema,
  validRecords,
} from './schemas'

const product = { name: 'Диван', brandSlug: 'minotti', categorySlug: 'sofas' }

describe('схемы данных админки', () => {
  it('принимает товар и сохраняет неизвестные поля', () => {
    const parsed = productDataSchema.parse({ ...product, summary: 'Текст', specs: { a: 1 } })
    expect(parsed.summary).toBe('Текст')
  })

  it('товар без названия — понятная ошибка', () => {
    const result = productDataSchema.safeParse({ ...product, name: '  ' })
    expect(result.success).toBe(false)
    if (!result.success) expect(firstIssue(result.error)).toBe('Укажите название')
  })

  it('фото товара — только строки', () => {
    expect(productDataSchema.safeParse({ ...product, images: [{ x: 1 }] }).success).toBe(false)
  })

  it('флаг публикации — только да/нет', () => {
    const body = recordBodySchema(productDataSchema)
    expect(body.safeParse({ data: product, published: 'yes' }).success).toBe(false)
    expect(body.safeParse({ data: product }).success).toBe(true)
  })

  it('бренд без названия не принимается', () => {
    expect(brandDataSchema.safeParse({ name: '' }).success).toBe(false)
  })

  it('значение правки — строка ограниченной длины', () => {
    expect(contentBodySchema.safeParse({ value: 5 }).success).toBe(false)
    expect(contentBodySchema.safeParse({ value: 'x'.repeat(300_001) }).success).toBe(false)
  })

  it('из ответа API отбрасывает только неверные записи', () => {
    const items = validRecords({
      items: [
        { slug: 'a', published: true, data: { name: 'A' } },
        { slug: '', published: true, data: {} },
        'мусор',
        { slug: 'b', published: false, data: [] },
      ],
    })
    expect(items?.map((item) => item.slug)).toEqual(['a'])
    expect(validRecords({ nope: 1 })).toBeNull()
  })
})
