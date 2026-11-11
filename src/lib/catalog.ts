import { brands } from '../data/brands'
import { products as allProducts } from '../data/products'
import type { Brand, Product, ProductFilters } from '../types'

export function getBrands(): Brand[] {
  return brands.slice()
}

export function getBrandBySlug(slug: string): Brand | null {
  const key = String(slug || '').toLowerCase()
  return brands.find((item) => item.slug === key) ?? null
}

/** Каноническое имя бренда (Baxter, Visionnaire…) — не slug и не lowercase. */
export function resolveBrandName(
  brandSlugOrName: string | { brandSlug?: string; brand?: string },
): string {
  if (typeof brandSlugOrName === 'string') {
    const bySlug = getBrandBySlug(brandSlugOrName)
    if (bySlug) return bySlug.name
    const byName = brands.find(
      (b) => b.name.toLowerCase() === brandSlugOrName.toLowerCase(),
    )
    return byName?.name || brandSlugOrName
  }
  if (brandSlugOrName.brandSlug) {
    const bySlug = getBrandBySlug(brandSlugOrName.brandSlug)
    if (bySlug) return bySlug.name
  }
  if (brandSlugOrName.brand) {
    return resolveBrandName(brandSlugOrName.brand)
  }
  return ''
}

/** Следующий бренд по кругу: Visionnaire → Molteni&C → Baxter → Bonaldo → … */
export function getNextBrand(slug: string): Brand {
  const list = getBrands()
  const key = String(slug || '').toLowerCase()
  const index = list.findIndex((item) => item.slug === key)
  if (index < 0) return list[0]!
  return list[(index + 1) % list.length]!
}

export function getProducts(filters: ProductFilters = {}): Product[] {
  const { category, brand, material, size, color } = filters
  return allProducts.filter((item) => {
    if (category) {
      const matchCategory =
        item.categorySlug === category ||
        item.category === category ||
        item.categorySlug === category.toLowerCase()
      if (!matchCategory) return false
    }
    if (brand) {
      const matchBrand =
        item.brand === brand ||
        item.brandSlug === brand ||
        item.brandSlug === brand.toLowerCase()
      if (!matchBrand) return false
    }
    if (material) {
      const materials = item.characteristics?.materials?.value || ''
      if (!materials.toLowerCase().includes(material.toLowerCase())) return false
    }
    if (size) {
      const dimensions = item.characteristics?.dimensions?.value || ''
      if (!dimensions.toLowerCase().includes(size.toLowerCase())) return false
    }
    if (color) {
      const variants = item.variants || item.colors || []
      const hit = variants.some(
        (variant) => variant.name.toLowerCase() === color.toLowerCase(),
      )
      if (!hit) return false
    }
    return true
  })
}

export type ProductView = Product & {
  description: string
  specs: Record<string, string>
  colors: NonNullable<Product['variants']>
  sku: string
  price: string
  priceAmount: null
}

const SPEC_LABELS: Record<string, string> = {
  dimensions: 'Размеры',
  materials: 'Материалы',
  finishes: 'Отделки',
  sku: 'Артикул',
}

/** Только поля characteristics со status === 'approved'. */
export function getApprovedSpecs(
  product: Product,
): Array<[string, string]> {
  const chars = product.characteristics
  if (!chars) return []
  const entries: Array<[string, string]> = []
  for (const key of ['dimensions', 'materials', 'finishes', 'sku'] as const) {
    const field = chars[key]
    if (field?.status === 'approved' && field.value) {
      entries.push([SPEC_LABELS[key] ?? key, field.value])
    }
  }
  return entries
}

/**
 * Демо-характеристики (status: 'placeholder') — только при showProductPlaceholders.
 * Значения живут в data/products.ts, не в JSX.
 */
export function getPlaceholderSpecs(
  product: Product,
): Array<[string, string]> {
  const chars = product.characteristics
  if (!chars) return []
  const entries: Array<[string, string]> = []
  for (const key of ['dimensions', 'materials', 'finishes', 'sku'] as const) {
    const field = chars[key]
    if (field?.status === 'placeholder' && field.value) {
      entries.push([SPEC_LABELS[key] ?? key, field.value])
    }
  }
  return entries
}

export function getProductBySlug(slug: string): ProductView | null {
  const item = allProducts.find((entry) => entry.slug === slug) ?? null
  if (!item) return null
  const specs = Object.fromEntries(getApprovedSpecs(item))
  const skuField = item.characteristics?.sku
  return {
    ...item,
    description: item.shortDescription,
    specs,
    colors: item.variants || item.colors || [],
    sku: skuField?.value || item.slug,
    price: 'Стоимость — по запросу',
    priceAmount: null,
  }
}

/**
 * Другие модели того же бренда (этап 10b).
 * Секцию на странице показывают при ≥2 результатах.
 */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  if (!product) return []
  return allProducts
    .filter(
      (item) =>
        item.slug !== product.slug && item.brandSlug === product.brandSlug,
    )
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit)
}

/** Картинный src карточки (image → images[0]). */
export function productCardImageSrc(product: Product): string {
  return (product.image || product.images?.[0] || '').trim()
}

/**
 * В одной сетке «Другие модели» — без двух одинаковых кадров.
 * Повтор → пустой image (ProductCard покажет Placeholder).
 */
export function withUniqueRelatedImages(items: Product[]): Product[] {
  const seen = new Set<string>()
  return items.map((item) => {
    const src = productCardImageSrc(item)
    if (!src || seen.has(src)) {
      return {
        ...item,
        image: '',
        images: [],
        variants: item.variants?.map((variant) => ({
          ...variant,
          image: undefined,
        })),
        colors: item.colors?.map((variant) => ({
          ...variant,
          image: undefined,
        })),
      }
    }
    seen.add(src)
    return item
  })
}
