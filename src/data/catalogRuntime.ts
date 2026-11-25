import type { Category } from '../types'
import { categories } from './categories'
import { navigation } from './navigation'
import { rooms, type Room } from './rooms'

/**
 * Типы мебели и комнаты из админки (catalog.types, catalog.rooms):
 * переименовать, переставить, добавить, удалить. Объекты из кода
 * меняются на месте — на них ссылаются страницы.
 */

export type TypeItem = { slug: string; label: string; singular?: string; description?: string }
export type RoomItem = { slug: string; label: string; genitive?: string; categorySlugs: string[] }

export const codeTypes: readonly Category[] = categories.map((item) => ({ ...item }))
export const codeRooms: readonly Room[] = rooms.map((item) => ({ ...item, categorySlugs: [...item.categorySlugs] }))

const typeObjects = new Map(categories.map((item) => [item.slug, item]))
const roomObjects = new Map(rooms.map((item) => [item.slug, item]))

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/

export function applyTypesList(list: unknown) {
  if (!Array.isArray(list)) return
  const next: Category[] = list
    .filter((item): item is TypeItem => Boolean(item) && SLUG_RE.test(item.slug) && Boolean(item.label?.trim()))
    .map((item) => {
      const target = typeObjects.get(item.slug) || ({ status: 'approved' } as Category)
      return Object.assign(target, {
        slug: item.slug,
        label: item.label.trim(),
        singular: item.singular?.trim() || item.label.trim(),
        description: item.description?.trim() || '',
        href: `/catalog/${item.slug}`,
      })
    })
  if (!next.length) return
  categories.splice(0, categories.length, ...next)
  /* «По типам» в меню — тот же список */
  for (const section of navigation) {
    for (const group of section.subgroups || []) {
      if (group.title !== 'По типам') continue
      group.links.splice(
        0,
        group.links.length,
        ...next.map((cat) => ({ label: cat.label, href: `/catalog/${cat.slug}` })),
      )
    }
  }
}

export function applyRoomsList(list: unknown) {
  if (!Array.isArray(list)) return
  const next: Room[] = list
    .filter((item): item is RoomItem => Boolean(item) && SLUG_RE.test(item.slug) && Boolean(item.label?.trim()))
    .map((item) => {
      const target = roomObjects.get(item.slug) || ({} as Room)
      return Object.assign(target, {
        slug: item.slug,
        label: item.label.trim(),
        genitive: item.genitive?.trim() || item.label.trim().toLowerCase(),
        categorySlugs: Array.isArray(item.categorySlugs) ? item.categorySlugs : [],
      })
    })
  if (next.length) rooms.splice(0, rooms.length, ...next)
}
