import { filterProducts } from '../catalog/catalog'
import { interiors } from '../data/interiors'
import { products } from '../data/products'
import { getRoomBySlug, rooms, type Room } from '../data/rooms'
import type { InteriorSelection, Product } from '../types'

/** Товары комнаты; brandSlug — только товары этой фабрики */
export function getRoomProducts(roomSlug: string, brandSlug = ''): Product[] {
  const items = filterProducts(products, { room: roomSlug }) as Product[]
  return brandSlug ? items.filter((item) => item.brandSlug === brandSlug) : items
}

/** Комнаты, в которых есть товары (с brandSlug — товары этой фабрики) */
export function getAvailableRooms(brandSlug = ''): Room[] {
  return rooms.filter((room) => getRoomProducts(room.slug, brandSlug).length > 0)
}

export function getRoomInteriors(roomSlug: string): InteriorSelection[] {
  return interiors.filter((item) => item.room === roomSlug)
}

export { getRoomBySlug }

/** Комнаты товара: своё поле rooms или выводятся из категории */
export function getProductRooms(product: Product): string[] {
  if (product.rooms?.length) return product.rooms
  return rooms
    .filter((room) => room.categorySlugs.includes(product.categorySlug))
    .map((room) => room.slug)
}
