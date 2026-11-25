import type { Product } from '../types'
import { products } from './products'

/**
 * Товары из админки поверх товаров из кода. Массив `products` меняется
 * на месте, поэтому все модули, которые его импортировали, видят итог.
 */

export type AdminProductRecord = {
  slug: string
  published: boolean
  data: Partial<Product>
}

/** Товары из кода (и демо) — до правок; админка показывает их рядом с базой */
export const codeProducts: readonly Product[] = products.slice()

/** Привести запись из базы к полному товару сайта */
export function normalizeProduct(slug: string, data: Partial<Product>, base?: Product): Product {
  const images = (data.images || base?.images || []).filter(Boolean)
  return {
    ...(base || {}),
    ...data,
    slug,
    brand: data.brand || base?.brand || '',
    brandSlug: data.brandSlug || base?.brandSlug || '',
    name: data.name || base?.name || '',
    category: data.category || base?.category || '',
    categorySlug: data.categorySlug || base?.categorySlug || '',
    shortDescription: data.shortDescription ?? base?.shortDescription ?? '',
    images,
    image: images[0] || data.image || base?.image || '',
    status: 'approved',
    demo: false,
  } as Product
}

export function applyAdminProducts(records: AdminProductRecord[]) {
  const bySlug = new Map(codeProducts.map((item) => [item.slug, item]))
  const result: Product[] = []
  const overridden = new Map(records.map((item) => [item.slug, item]))

  for (const item of codeProducts) {
    const record = overridden.get(item.slug)
    if (!record) result.push(item)
    else if (record.published) result.push(normalizeProduct(item.slug, record.data, item))
  }
  /* новые товары из админки — в начало каталога */
  const added = records
    .filter((record) => record.published && !bySlug.has(record.slug))
    .map((record) => normalizeProduct(record.slug, record.data))

  products.splice(0, products.length, ...added, ...result)
}
