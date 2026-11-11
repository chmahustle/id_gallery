import type { Product } from '../types'

export type ColorFacet = {
  id: string
  name: string
  swatch?: string
}

function facetSource(products: Product[]): Product[] {
  // В production — только утверждённые; в dev видны и placeholder-данные
  if (import.meta.env.PROD) {
    return products.filter((item) => item.status === 'approved')
  }
  return products
}

export function collectMaterialFacets(products: Product[]): string[] {
  const set = new Set<string>()
  for (const item of facetSource(products)) {
    const value = item.characteristics?.materials?.value?.trim()
    if (value) set.add(value)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ru'))
}

export function collectSizeFacets(products: Product[]): string[] {
  const set = new Set<string>()
  for (const item of facetSource(products)) {
    const value = item.characteristics?.dimensions?.value?.trim()
    if (value) set.add(value)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ru'))
}

export function collectColorFacets(products: Product[]): ColorFacet[] {
  const map = new Map<string, ColorFacet>()
  for (const item of facetSource(products)) {
    const variants = item.variants || item.colors || []
    for (const variant of variants) {
      const name = variant.name?.trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (!map.has(key)) {
        map.set(key, {
          id: variant.id || key,
          name,
          swatch: variant.swatch,
        })
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

export function countActiveCatalogFilters(filters: {
  category?: string
  room?: string
  brand?: string
  materials?: string[]
  sizes?: string[]
  colors?: string[]
}): number {
  let count = 0
  if (filters.category) count += 1
  if (filters.room) count += 1
  if (filters.brand) count += 1
  count += filters.materials?.length ?? 0
  count += filters.sizes?.length ?? 0
  count += filters.colors?.length ?? 0
  return count
}
