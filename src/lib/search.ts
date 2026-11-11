import { brands } from '../data/brands'
import type { Brand, Product } from '../types'

/** Нижний регистр, ё → е, пробелы схлопнуты */
export function normalizeText(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim()
}

function words(value: string): string[] {
  return normalizeText(value).split(/[^a-zа-я0-9&]+/i).filter(Boolean)
}

const PREFIX_MIN = 4

/** Слово запроса подходит слову текста: по началу слова от 4 букв, иначе целиком */
function tokenMatches(token: string, haystack: string[]): boolean {
  const numeric = /^\d+$/.test(token)
  return haystack.some((word) => {
    if (numeric) return /^\d+$/.test(word) && Number(word) === Number(token)
    if (token.length >= PREFIX_MIN) return word.startsWith(token)
    return word === token
  })
}

function matchesAll(query: string, haystack: string[]): boolean {
  const tokens = words(query)
  if (tokens.length === 0) return false
  return tokens.every((token) => tokenMatches(token, haystack))
}

function productWords(item: Product): string[] {
  return words(
    [item.name, item.brand, item.category, item.subcategory].filter(Boolean).join(' '),
  )
}

/** Товары по запросу: название модели, бренд, категория */
export function searchProducts(list: Product[], query: string): Product[] {
  if (!normalizeText(query)) return []
  return list.filter((item) => matchesAll(query, productWords(item)))
}

/** Бренды по запросу: только по названию бренда */
export function searchBrands(query: string): Brand[] {
  if (!normalizeText(query)) return []
  return brands.filter((brand) => matchesAll(query, words(`${brand.name} ${brand.slug}`)))
}
