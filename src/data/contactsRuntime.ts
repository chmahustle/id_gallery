import type { ShowroomEntry, SiteContact } from '../types'
import { contacts } from './contacts'
import { showrooms } from './showrooms'

/**
 * Контакты и шоурумы из админки (вкладка «Контакты и шоурумы»).
 * Хранятся в правках контента: contacts.list и showrooms.list (JSON).
 */

export type ContactType = 'phone' | 'email' | 'whatsapp' | 'address' | 'hours' | 'other'

export type ContactItem = {
  type: ContactType
  /** Подпись строки; пусто — по типу («Телефон», «Электронная почта»…) */
  label?: string
  value: string
}

export const CONTACT_TYPES: { type: ContactType; label: string; placeholder: string }[] = [
  { type: 'phone', label: 'Телефон', placeholder: '+7 700 000 00 00' },
  { type: 'email', label: 'Электронная почта', placeholder: 'info@idgallery.kz' },
  { type: 'whatsapp', label: 'WhatsApp', placeholder: '+7 700 000 00 00' },
  { type: 'address', label: 'Адрес', placeholder: 'Город, улица, дом' },
  { type: 'hours', label: 'Часы работы', placeholder: 'Пн–Сб 10:00–20:00' },
  { type: 'other', label: 'Другое', placeholder: 'Значение' },
]

export const contactTypeLabel = (type: ContactType) =>
  CONTACT_TYPES.find((item) => item.type === type)?.label || 'Контакт'

const digits = (value: string) => value.replace(/[^\d+]/g, '')

/** Ссылка для строки контакта: позвонить, написать, открыть WhatsApp */
export function contactHref(item: ContactItem): string {
  const value = item.value.trim()
  if (item.type === 'phone') return `tel:${digits(value)}`
  if (item.type === 'email') return `mailto:${value}`
  if (item.type === 'whatsapp') {
    let d = value.replace(/\D/g, '')
    if (d.startsWith('8') && d.length === 11) d = `7${d.slice(1)}`
    return d ? `https://wa.me/${d}` : ''
  }
  return ''
}

/** Контакты страницы «Контакты» и подвала — список из админки */
export function applyContactsList(list: unknown) {
  if (!Array.isArray(list)) return
  const rows: SiteContact[] = list
    .filter((item): item is ContactItem => Boolean(item) && typeof item.value === 'string')
    .filter((item) => item.value.trim())
    .map((item) => ({
      label: item.label?.trim() || contactTypeLabel(item.type),
      value: item.value.trim(),
      ...(contactHref(item) ? { href: contactHref(item) } : {}),
      status: 'approved',
    }))
  contacts.splice(0, contacts.length, ...rows)
}

/** Шоурум из админки: всё, что нужно странице «Шоурумы» */
export type ShowroomItem = {
  slug: string
  name: string
  city: string
  address: string
  hours: string
  phone?: string
  image: string
  /** Своя ссылка на Яндекс.Карты; пусто — карта строится по адресу */
  map?: string
  published?: boolean
}

/** Встраиваемая карта: своя ссылка (виджет Яндекс.Карт) или поиск по адресу */
export function mapSrcFor(item: { map?: string; city?: string; address?: string }): string {
  const own = String(item.map || '').trim()
  if (/^https:\/\/yandex\.(ru|kz|com)\/map-widget\//.test(own)) return own
  if (/^https:\/\/yandex\.(ru|kz|com)\/maps\//.test(own)) {
    return own.replace('/maps/', '/map-widget/v1/')
  }
  const query = [item.city, item.address].filter(Boolean).join(', ').trim()
  return query ? `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(query)}&z=16` : ''
}

const CENTER = { x: 50, y: 60, zoom: 1.6 }

/** Шоурумы из кода — до правок; с них редактор начинает в первый раз */
const codeShowrooms: readonly ShowroomEntry[] = showrooms.slice()

const realValue = (value?: string) => {
  const v = String(value || '').trim()
  return v && !/^\[[^\]]+\]$/.test(v) ? v : ''
}

export function showroomsCodeList(): ShowroomItem[] {
  return codeShowrooms.map((item) => ({
    slug: item.slug,
    name: realValue(item.name),
    city: realValue(item.city),
    address: realValue(item.address),
    hours: realValue(item.hours),
    phone: realValue(item.phone),
    image: item.image,
    map: '',
    published: true,
  }))
}

/** Шоурумы страницы «Шоурумы» и главной — список из админки */
export function applyShowroomsList(list: unknown) {
  if (!Array.isArray(list)) return
  const rows: ShowroomEntry[] = list
    .filter((item): item is ShowroomItem => Boolean(item) && typeof item.name === 'string')
    .filter((item) => item.published !== false && item.name.trim())
    .map((item, index) => ({
      slug: item.slug || `showroom-${index + 1}`,
      name: item.name.trim(),
      city: (item.city || '').trim(),
      address: (item.address || '').trim(),
      hours: (item.hours || '').trim(),
      phone: (item.phone || '').trim(),
      mapSrc: mapSrcFor(item),
      image: item.image || '',
      imageFocus: CENTER,
      status: 'approved',
    }))
  showrooms.splice(0, showrooms.length, ...rows)
}
