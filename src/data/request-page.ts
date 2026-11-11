import { brands } from './brands'
import { products } from './products'
import { showrooms } from './showrooms'

/**
 * /request/ — docs/content-brief.md §18.
 */

export const requestPageCopy = {
  heroTitle: 'Запросить предложение',
  heroLead:
    'Укажите интересующую модель или задачу. Мы свяжемся с вами для уточнения деталей.',
  tabOffer: 'Запросить предложение',
  tabVisit: 'Запросить посещение',
  visitTitle: 'Запросить посещение',
  visitLead:
    'Укажите желаемую дату, время и интересующий бренд или модель.',
  fieldShowroom: 'Шоурум',
  fieldName: 'Имя',
  fieldContact: 'Телефон или электронная почта',
  fieldModel: 'Интересующая модель',
  fieldComment: 'Комментарий',
  fieldDate: 'Желаемая дата',
  fieldTime: 'Желаемое время',
  fieldBrandOrModel: 'Бренд или модель',
  submit: 'Отправить запрос',
  errorRequired: 'Заполните поле',
  errorNeedModelOrComment: 'Укажите модель или комментарий',
  errorNeedDateOrTime: 'Укажите дату или время',
  errorDatePast: 'Дата не раньше сегодня',
} as const

export type RequestType = 'offer' | 'visit'

/** Фото слева; ≠ hero /contact/ (molteni) */
export const requestAsideImage = {
  image: '/images/Gemini_Generated_Image_sq76gsq76gsq76gs.jpg',
  objectPosition: '50% 45%',
  width: 2752,
  height: 1536,
} as const

export function parseRequestType(raw: string | null): RequestType {
  return raw === 'visit' ? 'visit' : 'offer'
}

/** Подпись шоурума «Название · Город» по slug из адреса */
export function labelForShowroomSlug(slug: string): string | null {
  const item = showrooms.find((entry) => entry.slug === slug)
  return item ? `${item.name} · ${item.city}` : null
}

function brandName(slug: string): string {
  return brands.find((b) => b.slug === slug)?.name ?? slug
}

/** Подпись «Бренд · Модель NN» */
export function productSuggestionLabel(
  brandSlug: string,
  productName: string,
): string {
  return `${brandName(brandSlug)} · ${productName}`
}

export function getModelSuggestions(): string[] {
  return products.map((p) => productSuggestionLabel(p.brandSlug, p.name))
}

export function getBrandAndModelSuggestions(): string[] {
  const brandNames = brands.map((b) => b.name)
  return [...brandNames, ...getModelSuggestions()]
}

export function labelForModelSlug(slug: string): string | null {
  const product = products.find((p) => p.slug === slug)
  if (!product) return null
  return productSuggestionLabel(product.brandSlug, product.name)
}

export function labelForBrandSlug(slug: string): string | null {
  return brands.find((b) => b.slug === slug)?.name ?? null
}

export function todayISODate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
