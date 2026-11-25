import { afterEach, describe, expect, it } from 'vitest'
import { interiors } from './interiors'
import { applyInteriorRecords, codeInteriors } from './interiorsRuntime'

const first = codeInteriors[0]

describe('интерьеры из админки', () => {
  afterEach(() => applyInteriorRecords([]))

  it('без записей — интерьеры из кода', () => {
    applyInteriorRecords([])
    expect(interiors.map((item) => item.slug)).toEqual(codeInteriors.map((item) => item.slug))
  })

  it('правит интерьер из кода на месте', () => {
    const target = interiors.find((item) => item.slug === first.slug)
    applyInteriorRecords([{ slug: first.slug, title: 'Новый заголовок', caption: 'Текст' }])
    expect(target?.title).toBe('Новый заголовок')
    expect(target?.caption).toBe('Текст')
  })

  it('скрытый и удалённый интерьер пропадает с сайта', () => {
    applyInteriorRecords([{ slug: first.slug, published: false }])
    expect(interiors.some((item) => item.slug === first.slug)).toBe(false)
  })

  it('добавляет новый интерьер только с заголовком', () => {
    applyInteriorRecords([
      { slug: 'test-new', title: 'Новый', image: '/a.jpg' },
      { slug: 'test-untitled', title: ' ' },
    ])
    expect(interiors.some((item) => item.slug === 'test-new')).toBe(true)
    expect(interiors.some((item) => item.slug === 'test-untitled')).toBe(false)
  })

  it('точки на фото — только с товаром и в пределах кадра', () => {
    applyInteriorRecords([
      {
        slug: first.slug,
        hotspots: [
          { product: 'sofa', x: 120, y: -10 },
          { product: '', x: 10, y: 10 },
        ],
      },
    ])
    const target = interiors.find((item) => item.slug === first.slug)
    expect(target?.hotspots).toEqual([{ product: 'sofa', x: 100, y: 0 }])
  })

  it('игнорирует мусор вместо списка', () => {
    applyInteriorRecords('не список')
    applyInteriorRecords([null, 5, { title: 'без адреса' }])
    expect(interiors.length).toBe(codeInteriors.length)
  })
})
