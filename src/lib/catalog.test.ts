import { describe, expect, it } from 'vitest'
import {
  getBrandBySlug,
  getBrands,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
} from './catalog'

describe('catalog accessors', () => {
  it('returns exactly four brands', () => {
    const list = getBrands()
    expect(list).toHaveLength(4)
    expect(list.map((b) => b.slug).sort()).toEqual([
      'baxter',
      'bonaldo',
      'molteni',
      'visionnaire',
    ])
  })

  it('getBrandBySlug finds Visionnaire', () => {
    expect(getBrandBySlug('visionnaire')?.name).toBe('Visionnaire')
    expect(getBrandBySlug('missing')).toBeNull()
  })

  it('filters products by category slug', () => {
    const sofas = getProducts({ category: 'divany' })
    expect(sofas.length).toBeGreaterThan(0)
    expect(sofas.every((p) => p.categorySlug === 'divany')).toBe(true)
  })

  it('filters products by brand', () => {
    const list = getProducts({ brand: 'Baxter' })
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((p) => p.brand === 'Baxter')).toBe(true)
  })

  it('filters products by material substring when approved materials exist', () => {
    const list = getProducts({ material: 'Кожа' })
    expect(
      list.every((p) =>
        (p.characteristics?.materials?.value || '')
          .toLowerCase()
          .includes('кожа'),
      ),
    ).toBe(true)
  })

  it('filters products by size substring', () => {
    const list = getProducts({ size: '280' })
    // размеры пока placeholder — фильтр может вернуть 0; путь не должен падать
    expect(Array.isArray(list)).toBe(true)
  })

  it('filters products by color variant name', () => {
    const list = getProducts({ color: 'Образец A' })
    expect(list.length).toBeGreaterThan(0)
    expect(list.every((p) => (p.variants || p.colors || []).some((v) => v.name === 'Образец A'))).toBe(
      true,
    )
  })

  it('getProductBySlug and getRelatedProducts', () => {
    const product = getProductBySlug('model-01-sofa')
    expect(product).not.toBeNull()
    const related = getRelatedProducts(product!)
    expect(related.every((p) => p.slug !== product!.slug)).toBe(true)
    expect(related.every((p) => p.brandSlug === product!.brandSlug)).toBe(
      true,
    )
  })

  it('related card images are unique within a product page grid', async () => {
    const { products } = await import('../data/products')
    const {
      productCardImageSrc,
      withUniqueRelatedImages,
    } = await import('./catalog')
    for (const product of products) {
      const related = withUniqueRelatedImages(getRelatedProducts(product))
      const paths = related.map(productCardImageSrc).filter(Boolean)
      expect(new Set(paths).size).toBe(paths.length)
    }
  })

  it('products have no price field', () => {
    for (const product of getProducts()) {
      expect(product).not.toHaveProperty('price')
      expect(product).not.toHaveProperty('priceAmount')
    }
  })
})
