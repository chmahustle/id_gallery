import { describe, expect, it } from 'vitest'
import { sortProducts } from '../catalog/catalog'
import type { Product } from '../types'
import { parsePriceAmount, priceRanks } from './price'

describe('сумма из текста цены', () => {
  it.each([
    ['1 200 000 ₸', 1_200_000],
    ['от 450 000 до 600 000', 450_000],
    ['1.200.000', 1_200_000],
    ['1,2 млн ₸', 1_200_000],
    ['850 тыс.', 850_000],
    ['99 990,50', 99_990.5],
  ])('%s → %d', (text, amount) => {
    expect(parsePriceAmount(text)).toBe(amount)
  })

  it('без числа суммы нет', () => {
    expect(parsePriceAmount('по запросу')).toBeNull()
    expect(parsePriceAmount('')).toBeNull()
    expect(parsePriceAmount(undefined)).toBeNull()
  })

  it('порядок цен: одинаковые суммы — один номер', () => {
    expect(priceRanks(['300', 'по запросу', '100', '300', undefined])).toEqual([2, null, 1, 2, null])
  })
})

describe('сортировка каталога по цене', () => {
  const item = (slug: string, extra: Partial<Product>) =>
    ({ slug, name: slug, brand: 'B', ...extra }) as Product
  const names = (list: Product[]) => list.map((product) => product.slug)

  it('у посетителя — по порядку с сервера, без цены — в конце', () => {
    const list = [item('c', { priceRank: 3 }), item('none', {}), item('a', { priceRank: 1 })]
    expect(names(sortProducts(list, 'price-asc'))).toEqual(['a', 'c', 'none'])
    expect(names(sortProducts(list, 'price-desc'))).toEqual(['c', 'a', 'none'])
  })

  it('в админке — по сумме из текста цены', () => {
    const list = [item('m', { price: '1,2 млн ₸' }), item('k', { price: '900 000 ₸' })]
    expect(names(sortProducts(list, 'price-asc'))).toEqual(['k', 'm'])
  })
})
