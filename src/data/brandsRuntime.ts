import type { Brand } from '../types'
import { brands } from './brands'

/**
 * Бренды из админки поверх брендов из кода. Объекты брендов из кода
 * дополняются на месте (на них ссылаются страницы и реестр полей),
 * новые добавляются в конец, скрытые убираются из списка.
 */

/**
 * Запись бренда из админки: поля бренда сайта, подборки на его странице
 * (featuredSlugs — товары, interiorSlugs — интерьеры) и другие поля.
 */
export type AdminBrandRecord = {
  slug: string
  published: boolean
  data: Partial<Brand> & {
    featuredSlugs?: string[]
    interiorSlugs?: string[]
    [key: string]: unknown
  }
}

/** Бренды из кода — копии до правок, для «вернуть версию из кода» */
export const codeBrands: readonly Brand[] = brands.map((brand) => ({ ...brand }))
const codeObjects = new Map(brands.map((brand) => [brand.slug, brand]))

export function normalizeBrand(slug: string, data: Partial<Brand>): Brand {
  const name = String(data.name || slug)
  return {
    filter: name,
    description: '',
    intro: '',
    about: '',
    catalogText: `Модели ${name}, представленные в каталоге ID Gallery.`,
    collectionsLabel: `Коллекции ${name}`,
    collectionsText: '',
    collectionsCta: 'Смотреть коллекции',
    requestText: 'Уточните интересующую модель и исполнение у специалиста ID Gallery.',
    ctaLabel: `Смотреть ${name}`,
    logo: '',
    status: 'approved',
    ...data,
    slug,
    name,
  } as Brand
}

export function applyAdminBrands(records: AdminBrandRecord[]) {
  const bySlug = new Map(records.map((record) => [record.slug, record]))
  const result: Brand[] = []

  for (const original of codeBrands) {
    const target = codeObjects.get(original.slug)!
    const record = bySlug.get(original.slug)
    /* сначала вернуть поля из кода, затем наложить правки */
    for (const key of Object.keys(target)) delete (target as Record<string, unknown>)[key]
    Object.assign(target, original, record ? record.data : {}, { slug: original.slug })
    if (!record || record.published) result.push(target)
  }
  for (const record of records) {
    if (codeObjects.has(record.slug) || !record.published) continue
    result.push(normalizeBrand(record.slug, record.data))
  }
  brands.splice(0, brands.length, ...result)
}
