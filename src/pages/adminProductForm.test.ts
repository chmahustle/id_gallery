import { describe, expect, it } from 'vitest'
import type { Product } from '../types'
import { emptyVariant, fromForm, toForm } from './adminProductForm'

const product: Partial<Product> = {
  slug: 'test-sofa',
  name: 'Диван Тест',
  brandSlug: 'visionnaire',
  categorySlug: 'sofas',
  summary: 'Кратко',
  shortDescription: 'Подробно',
  images: ['/a.jpg', '/b.jpg#frame=20,30,1.5'],
  image: '/a.jpg',
  variants: [
    {
      id: 'v1',
      name: 'Кожа, табак',
      swatch: '#8a5a3b',
      images: ['/c.jpg'],
      dimensions: { value: '220 × 95', status: 'approved' },
    },
  ],
  materialSwatches: [{ name: 'Орех', image: '/m.jpg', note: 'каркас' }],
  characteristics: {
    dimensions: { value: '220 × 95 × 80', status: 'approved' },
    sku: { value: 'VS-01', status: 'placeholder' },
  },
  rooms: ['living'],
  collection: 'Babylon',
  price: 'по запросу',
  author: { name: 'ФИО', slug: 'fio' },
  documents: [{ title: 'Паспорт', url: '/p.pdf', format: 'PDF' }],
  care: 'Сухая чистка',
}

describe('форма товара', () => {
  it('товар → форма → товар: ничего не теряется', () => {
    const data = fromForm(toForm(product))
    expect(data).toMatchObject({
      name: 'Диван Тест',
      brandSlug: 'visionnaire',
      categorySlug: 'sofas',
      images: product.images,
      image: '/a.jpg',
      collection: 'Babylon',
      price: 'по запросу',
      author: { name: 'ФИО', slug: 'fio' },
      care: 'Сухая чистка',
      rooms: ['living'],
      documents: product.documents,
      materialSwatches: product.materialSwatches,
      characteristics: product.characteristics,
    })
    expect(data.variants?.[0]).toMatchObject({
      id: 'v1',
      name: 'Кожа, табак',
      swatch: '#8a5a3b',
      image: '/c.jpg',
      images: ['/c.jpg'],
      dimensions: { value: '220 × 95', status: 'approved' },
    })
  })

  it('новый товар — бренд и тип по умолчанию, пустые поля', () => {
    const form = toForm(null)
    expect(form.brandSlug).toBeTruthy()
    expect(form.categorySlug).toBeTruthy()
    expect(form.images).toEqual([])
    expect(form.specs.dimensions).toEqual({ value: '', approved: false })
  })

  it('пустые строки не сохраняются', () => {
    const form = toForm(product)
    form.variants.push(emptyVariant())
    form.materialSwatches.push({ name: ' ', image: '', note: '' })
    form.documents.push({ title: 'Без файла', url: '', format: 'PDF' })
    form.specs.finishes = { value: '  ', approved: true }
    form.collection = ' '
    form.price = ''
    form.author = ''
    const data = fromForm(form)
    expect(data.variants).toHaveLength(1)
    expect(data.materialSwatches).toHaveLength(1)
    expect(data.documents).toHaveLength(1)
    expect(data.characteristics?.finishes).toBeUndefined()
    expect(data).not.toHaveProperty('collection')
    expect(data).not.toHaveProperty('price')
    expect(data).not.toHaveProperty('author')
  })

  it('исполнение без адреса получает его из названия', () => {
    const form = toForm(null)
    form.variants = [{ ...emptyVariant(), name: 'Бархат синий' }]
    expect(fromForm(form).variants?.[0].id).toBe('v1-barhat-siniy')
  })

  it('старое поле colors читается как исполнения', () => {
    const form = toForm({ ...product, variants: undefined, colors: product.variants })
    expect(form.variants).toHaveLength(1)
  })
})
