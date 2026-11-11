import { filterProducts } from '../catalog/catalog'
import { interiors } from '../data/interiors'
import { products } from '../data/products'
import { getRoomBySlug, rooms, type Room } from '../data/rooms'
import type { InteriorSelection, Product } from '../types'

export function getRoomProducts(roomSlug: string): Product[] {
  return filterProducts(products, { room: roomSlug }) as Product[]
}

/** Комнаты, в которых есть товары */
export function getAvailableRooms(): Room[] {
  return rooms.filter((room) => getRoomProducts(room.slug).length > 0)
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
