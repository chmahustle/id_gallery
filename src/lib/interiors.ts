import { interiors } from '../data/interiors'
import { products } from '../data/products'
import type { InteriorSelection, Product } from '../types'

export function getInteriors(): InteriorSelection[] {
  return interiors.slice()
}

export function getInteriorBySlug(slug: string): InteriorSelection | null {
  const key = String(slug || '').toLowerCase()
  return interiors.find((item) => item.slug === key) ?? null
}

/** Интерьеры, в которых участвует бренд (блок «Интерьеры» на странице бренда) */
export function getBrandInteriors(brandSlug: string): InteriorSelection[] {
  return interiors.filter((item) => item.brands?.includes(brandSlug))
}

/** Товары подборки по productIds (slug); отсутствующие пропускаем. */
export function getInteriorProducts(
  selection: InteriorSelection,
): Product[] {
  const bySlug = new Map(products.map((item) => [item.slug, item]))
  const result: Product[] = []
  for (const id of selection.productIds) {
    const hit = bySlug.get(id)
    if (hit) result.push(hit)
  }
  return result
}
