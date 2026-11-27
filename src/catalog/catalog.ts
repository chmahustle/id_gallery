import { categories as catalogCategories } from '../data/categories'
import { getRoomBySlug } from '../data/rooms'
import { getProductBySlug as getProductBySlugFromData, getRelatedProducts as getRelatedFromData } from '../lib/catalog'
import type { Category, Product } from '../types'
import { parsePriceAmount } from '../lib/price'

/** Товар в каталоге: у карточки из админки могут быть артикул и сумма цены */
export type CatalogProduct = Product & { sku?: string; priceAmount?: number | null }

export type SortValue = 'default' | 'name' | 'brand' | 'newest' | 'price-asc' | 'price-desc'

export type CatalogSearch = {
  q: string
  category: string
  sub: string
  room: string
  brand: string
  materials: string[]
  sizes: string[]
  colors: string[]
  status: string
  sort: SortValue
  page: number
  priceMin: number | null
  priceMax: number | null
}

export type ProductFilterOptions = {
  categoryLabel?: string
  categorySlug?: string
  sub?: string
  room?: string
  brand?: string
  materials?: string[]
  sizes?: string[]
  colors?: string[]
  status?: string
  priceMin?: number | null
  priceMax?: number | null
  q?: string
}

export type CategoryChip = { key: string; label: string; href: string; slug: string; sub: string }

export const PAGE_SIZE = 12

export const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'name', label: 'По названию' },
  { value: 'brand', label: 'По бренду' },
  { value: 'newest', label: 'По новизне' },
  { value: 'price-asc', label: 'Цена: по возрастанию' },
  { value: 'price-desc', label: 'Цена: по убыванию' },
]

export function slugify(value: unknown) {
  return String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
}

export function getCategoryBySlug(slug: string, categories: Category[] = catalogCategories) {
  return categories.find((cat) => cat.slug === slug) || null
}

export function getProductBySlug<T extends Product>(slug: string, list?: T[]) {
  if (list) return list.find((item) => item.slug === slug) || null
  return getProductBySlugFromData(slug)
}

export function getRelatedProducts<T extends Product>(
  product: Product | null | undefined,
  limit = 4,
  list?: T[],
): Product[] {
  if (list) {
    if (!product) return []
    return list
      .filter(
        (item) =>
          item.slug !== product.slug && item.brandSlug === product.brandSlug,
      )
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit)
  }
  return product ? getRelatedFromData(product, limit) : []
}

export function catalogPath(
  categorySlug?: string | null,
  params: Record<string, string | number | null | undefined> = {},
) {
  const base = categorySlug ? `/catalog/${categorySlug}` : '/catalog'
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '' || value === 'all') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `${base}?${qs}` : base
}

export function productPath(slug: string) {
  return `/product/${slug}`
}

function parseOptionalNumber(value: string | null) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export const STATUS_TOGGLES = [
  { label: 'В наличии', status: 'В наличии' },
  { label: 'В пути', status: 'В пути' },
  { label: 'Спецпредложение', status: 'Эксклюзив' },
]

function parseListParam(searchParams: URLSearchParams, key: string) {
  const all = searchParams.getAll(key).flatMap((value) =>
    String(value)
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean),
  )
  return [...new Set(all)]
}

export function parseCatalogSearch(searchParams: URLSearchParams): CatalogSearch {
  const sort = searchParams.get('sort') || 'default'
  const allowedSort = new Set<string>(SORT_OPTIONS.map((option) => option.value))
  return {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    sub: searchParams.get('sub') || '',
    room: searchParams.get('room') || '',
    brand: searchParams.get('brand') || '',
    materials: parseListParam(searchParams, 'material'),
    sizes: parseListParam(searchParams, 'size'),
    colors: parseListParam(searchParams, 'color'),
    status: searchParams.get('status') || '',
    sort: allowedSort.has(sort) ? (sort as SortValue) : 'default',
    page: Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1),
    priceMin: parseOptionalNumber(searchParams.get('priceMin')),
    priceMax: parseOptionalNumber(searchParams.get('priceMax')),
  }
}

export function filterProducts<T extends CatalogProduct>(
  list: T[],
  {
    categoryLabel,
    categorySlug,
    sub,
    room,
    brand,
    materials,
    sizes,
    colors,
    status,
    priceMin,
    priceMax,
    q,
  }: ProductFilterOptions = {},
): T[] {
  const query = String(q || '')
    .trim()
    .toLowerCase()
  const materialList = materials || []
  const sizeList = sizes || []
  const colorList = colors || []

  return list.filter((item) => {
    if (categorySlug) {
      const match =
        item.categorySlug === categorySlug ||
        item.categorySlug === String(categorySlug).toLowerCase()
      if (!match) return false
    }
    if (categoryLabel && item.category !== categoryLabel) return false
    if (sub && item.subcategory !== sub) return false
    if (room) {
      const roomDef = getRoomBySlug(room)
      const inRoom = item.rooms?.length
        ? item.rooms.includes(room)
        : roomDef?.categorySlugs.includes(item.categorySlug)
      if (!inRoom) return false
    }
    if (brand) {
      const matchBrand =
        item.brand === brand ||
        item.brandSlug === brand ||
        item.brandSlug === String(brand).toLowerCase()
      if (!matchBrand) return false
    }
    if (materialList.length) {
      const raw = item.characteristics?.materials?.value || ''
      if (!materialList.some((value) => raw === value)) return false
    }
    if (sizeList.length) {
      const raw = item.characteristics?.dimensions?.value || ''
      if (!sizeList.some((value) => raw === value)) return false
    }
    if (colorList.length) {
      const variants = item.variants || item.colors || []
      const names = variants.map((variant) => variant.name)
      if (!colorList.some((value) => names.includes(value))) return false
    }
    if (status && item.status !== status) return false
    if (priceMin != null && Number.isFinite(priceMin)) {
      if (item.priceAmount == null || item.priceAmount < priceMin) return false
    }
    if (priceMax != null && Number.isFinite(priceMax)) {
      if (item.priceAmount == null || item.priceAmount > priceMax) return false
    }
    if (query) {
      const hay = `${item.name} ${item.brand} ${item.category} ${item.subcategory} ${item.sku || ''}`
        .toLowerCase()
      if (!hay.includes(query)) return false
    }
    return true
  })
}

export function collectCategoryChips(categories: Category[] = catalogCategories) {
  const chips: CategoryChip[] = []
  for (const cat of categories) {
    if (!cat.label?.trim() || !cat.slug) continue
    chips.push({
      key: `cat-${cat.slug}`,
      label: cat.label,
      href: catalogPath(cat.slug),
      slug: cat.slug,
      sub: '',
    })
    for (const child of cat.children || []) {
      chips.push({
        key: `sub-${cat.slug}-${child}`,
        label: child,
        href: catalogPath(cat.slug, { sub: child }),
        slug: cat.slug,
        sub: child,
      })
    }
  }
  return chips
}

/**
 * Ключ сортировки по цене: у посетителя — порядок цен с сервера,
 * в админке — сумма из текста цены. Без цены — null (в конец списка).
 */
export function priceSortKey(item: CatalogProduct): number | null {
  if (typeof item.priceRank === 'number') return item.priceRank
  if (typeof item.priceAmount === 'number') return item.priceAmount
  return parsePriceAmount(item.price)
}

export function sortProducts<T extends CatalogProduct>(list: T[], sort: string): T[] {
  const items = [...list]
  switch (sort) {
    case 'newest':
      return items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    case 'price-asc':
      return items.sort((a, b) => {
        const av = priceSortKey(a) ?? Number.POSITIVE_INFINITY
        const bv = priceSortKey(b) ?? Number.POSITIVE_INFINITY
        return av - bv || a.name.localeCompare(b.name, 'ru')
      })
    case 'price-desc':
      return items.sort((a, b) => {
        const av = priceSortKey(a) ?? -1
        const bv = priceSortKey(b) ?? -1
        return bv - av || a.name.localeCompare(b.name, 'ru')
      })
    case 'name':
      return items.sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    case 'brand':
      return items.sort(
        (a, b) =>
          String(a.brand).localeCompare(String(b.brand), 'ru') ||
          a.name.localeCompare(b.name, 'ru'),
      )
    case 'default':
    default:
      /* порядок как в данных — без ранжирования по популярности */
      return items
  }
}

export function paginate<T>(list: T[], page: number, pageSize = PAGE_SIZE) {
  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  return {
    items: list.slice(start, start + pageSize),
    total,
    totalPages,
    page: safePage,
  }
}

export function collectBrands(list: Product[]) {
  return [...new Set(list.map((item) => item.brand).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
}

export function collectStatuses(list: Product[]) {
  const order: string[] = ['В наличии', 'Под заказ', 'Эксклюзив', 'В пути', 'Ожидается новинка']
  const set = new Set<string>(list.map((item) => item.status).filter(Boolean))
  return order.filter((status) => set.has(status)).concat(
    [...set].filter((status) => !order.includes(status)),
  )
}

export function priceBounds(list: CatalogProduct[]) {
  const amounts = list
    .map((item) => item.priceAmount)
    .filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
  if (!amounts.length) return null
  return {
    min: Math.min(...amounts),
    max: Math.max(...amounts),
  }
}

export function buildWhatsAppLeadUrl(phone: string | null | undefined, message: string) {
  let digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('8') && digits.length === 11) {
    digits = `7${digits.slice(1)}`
  }
  if (!digits) return '#'
  const url = new URL(`https://wa.me/${digits}`)
  url.searchParams.set('text', message)
  return url.toString()
}

export function formatPrice(product: Pick<Product, 'price'> | null | undefined) {
  if (!product) return ''
  return product.price || 'Стоимость — по запросу'
}
