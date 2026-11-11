import { products } from '../data/products'
import type { Product } from '../types'

/** Минимум товаров бренда, чтобы показать «Подборку товаров» */
export const FEATURED_MIN = 3

/**
 * Подборка бренда: до `limit` товаров. Сначала товары с собственным фото,
 * затем остальные товары бренда с демо-кадром, одолженным у товара с фото
 * (повторы допустимы, пока данные демонстрационные). Пусто, если у бренда
 * меньше FEATURED_MIN товаров или ни у одного нет фото.
 */
export function getBrandFeatured(brandSlug: string, limit = 8): Product[] {
  const mine = products.filter((item) => item.brandSlug === brandSlug)
  const withPhoto = mine.filter((item) => Boolean(item.image))
  if (mine.length < FEATURED_MIN || withPhoto.length === 0) return []
  const borrowed = mine
    .filter((item) => !item.image)
    .map((item, i) => ({
      ...item,
      image: withPhoto[i % withPhoto.length]!.image,
    }))
  return [...withPhoto, ...borrowed].slice(0, limit)
}
