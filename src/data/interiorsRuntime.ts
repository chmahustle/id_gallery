import type { InteriorHotspot, InteriorSelection } from '../types'
import { interiors } from './interiors'

/**
 * Интерьеры из админки (interiors.records): правки интерьеров из кода и
 * новые интерьеры. Объекты из кода меняются на месте — на них ссылаются
 * страницы и поля конструктора.
 */
export type InteriorRecord = {
  slug: string
  title?: string
  caption?: string
  image?: string
  room?: string
  brands?: string[]
  productIds?: string[]
  productsConfirmed?: boolean
  /** Точки товаров на фото: x, y — проценты от исходного кадра */
  hotspots?: InteriorHotspot[]
  published?: boolean
}

export const codeInteriors: readonly InteriorSelection[] = interiors.map((item) => ({ ...item }))
const codeObjects = new Map(interiors.map((item) => [item.slug, item]))

const CENTER = { x: 50, y: 55, zoom: 1 }

function pick(record: InteriorRecord): Partial<InteriorSelection> {
  const out: Partial<InteriorSelection> = {}
  if (typeof record.title === 'string' && record.title.trim()) out.title = record.title.trim()
  if (typeof record.caption === 'string') out.caption = record.caption.trim()
  if (typeof record.image === 'string' && record.image) out.image = record.image
  if (typeof record.room === 'string') out.room = record.room || undefined
  if (Array.isArray(record.brands)) out.brands = record.brands
  if (Array.isArray(record.productIds)) out.productIds = record.productIds
  if (typeof record.productsConfirmed === 'boolean') out.productsConfirmed = record.productsConfirmed
  if (Array.isArray(record.hotspots)) {
    out.hotspots = record.hotspots
      .filter((spot) => spot && typeof spot.product === 'string' && spot.product)
      .map((spot) => ({
        product: spot.product,
        x: Math.min(100, Math.max(0, Number(spot.x) || 0)),
        y: Math.min(100, Math.max(0, Number(spot.y) || 0)),
      }))
  }
  return out
}

export function applyInteriorRecords(list: unknown) {
  if (!Array.isArray(list)) return
  const records = list.filter(
    (item): item is InteriorRecord => Boolean(item) && typeof item.slug === 'string',
  )
  const bySlug = new Map(records.map((record) => [record.slug, record]))
  const result: InteriorSelection[] = []

  for (const original of codeInteriors) {
    const target = codeObjects.get(original.slug)!
    const record = bySlug.get(original.slug)
    for (const key of Object.keys(target)) delete (target as Record<string, unknown>)[key]
    Object.assign(target, original, record ? pick(record) : {})
    if (!record || record.published !== false) result.push(target)
  }
  for (const record of records) {
    if (codeObjects.has(record.slug) || record.published === false || !record.title?.trim()) continue
    result.push({
      slug: record.slug,
      title: record.title.trim(),
      caption: '',
      image: '',
      imageFocus: CENTER,
      productIds: [],
      status: 'approved',
      ...pick(record),
    } as InteriorSelection)
  }
  interiors.splice(0, interiors.length, ...result)
}
