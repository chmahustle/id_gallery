import { catalogCategories, products } from '../content'

export const PAGE_SIZE = 12

export const SORT_OPTIONS = [
  { value: 'popular', label: 'По популярности' },
  { value: 'newest', label: 'По новизне' },
  { value: 'price-asc', label: 'Цена по возрастанию' },
  { value: 'price-desc', label: 'Цена по убыванию' },
]

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
}

export function getCategoryBySlug(slug, categories = catalogCategories) {
  return categories.find((cat) => cat.slug === slug) || null
}

export function getProductBySlug(slug, list = products) {
  return list.find((item) => item.slug === slug) || null
}

export function getRelatedProducts(product, limit = 4, list = products) {
  if (!product) return []
  return list
    .filter(
      (item) =>
        item.slug !== product.slug &&
        (item.category === product.category || item.brand === product.brand),
    )
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit)
}

export function catalogPath(categorySlug, params = {}) {
  const base = categorySlug ? `/catalog/${categorySlug}` : '/catalog'
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '' || value === 'all') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `${base}?${qs}` : base
}

export function productPath(slug) {
  return `/product/${slug}`
}

function parseOptionalNumber(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function parseCatalogSearch(searchParams) {
  const sort = searchParams.get('sort') || 'popular'
  const allowedSort = new Set(['popular', 'newest', 'price-asc', 'price-desc'])
  return {
    sub: searchParams.get('sub') || '',
    brand: searchParams.get('brand') || '',
    status: searchParams.get('status') || '',
    sort: allowedSort.has(sort) ? sort : 'popular',
    page: Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1),
    priceMin: parseOptionalNumber(searchParams.get('priceMin')),
    priceMax: parseOptionalNumber(searchParams.get('priceMax')),
  }
}

export function filterProducts(list, { categoryLabel, sub, brand, status, priceMin, priceMax }) {
  return list.filter((item) => {
    if (categoryLabel && item.category !== categoryLabel) return false
    if (sub && item.subcategory !== sub) return false
    if (brand && item.brand !== brand) return false
    if (status && item.status !== status) return false
    if (priceMin != null && Number.isFinite(priceMin)) {
      if (item.priceAmount == null || item.priceAmount < priceMin) return false
    }
    if (priceMax != null && Number.isFinite(priceMax)) {
      if (item.priceAmount == null || item.priceAmount > priceMax) return false
    }
    return true
  })
}

export function sortProducts(list, sort) {
  const items = [...list]
  switch (sort) {
    case 'newest':
      return items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    case 'price-asc':
      return items.sort((a, b) => {
        const av = a.priceAmount ?? Number.POSITIVE_INFINITY
        const bv = b.priceAmount ?? Number.POSITIVE_INFINITY
        return av - bv || a.name.localeCompare(b.name, 'ru')
      })
    case 'price-desc':
      return items.sort((a, b) => {
        const av = a.priceAmount ?? -1
        const bv = b.priceAmount ?? -1
        return bv - av || a.name.localeCompare(b.name, 'ru')
      })
    case 'popular':
    default:
      return items.sort(
        (a, b) => (b.popularity || 0) - (a.popularity || 0) || a.name.localeCompare(b.name, 'ru'),
      )
  }
}

export function paginate(list, page, pageSize = PAGE_SIZE) {
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

export function collectBrands(list) {
  return [...new Set(list.map((item) => item.brand).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
}

export function collectStatuses(list) {
  const order = ['В наличии', 'Под заказ', 'Эксклюзив', 'В пути', 'Ожидается новинка']
  const set = new Set(list.map((item) => item.status).filter(Boolean))
  return order.filter((status) => set.has(status)).concat(
    [...set].filter((status) => !order.includes(status)),
  )
}

export function priceBounds(list) {
  const amounts = list.map((item) => item.priceAmount).filter((n) => Number.isFinite(n))
  if (!amounts.length) return null
  return {
    min: Math.min(...amounts),
    max: Math.max(...amounts),
  }
}

export function buildWhatsAppLeadUrl(phone, message) {
  let digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('8') && digits.length === 11) {
    digits = `7${digits.slice(1)}`
  }
  if (!digits) return '#'
  const url = new URL(`https://wa.me/${digits}`)
  url.searchParams.set('text', message)
  return url.toString()
}

export function formatPrice(product) {
  if (!product) return ''
  if (product.priceAmount != null && Number.isFinite(product.priceAmount)) {
    return `${product.priceAmount.toLocaleString('ru-RU')} ₽`
  }
  return product.price || 'по запросу'
}
