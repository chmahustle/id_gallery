import type { SiteContact } from '../types'
import { contacts } from './contacts'

/**
 * /contact/ — docs/content-brief.md §15.
 * Значения только из contacts (status placeholder|approved).
 * Hero — другой sourceId, чем /about/ и /trade/ (baxter).
 */

export const contactPageCopy = {
  heroTitle: 'Контакты',
  heroLead:
    'Свяжитесь с ID Gallery по вопросам моделей, стоимости, материалов и посещения шоурумов.',
  infoTitle: 'Контактная информация',
  /** Одна строка под заголовком, пока нет approved-значений */
  valuePending: 'Данные будут добавлены после подтверждения',
  formTitle: 'Написать нам',
  formLead: 'Оставьте контактные данные и коротко опишите ваш запрос.',
  fieldName: 'Имя',
  fieldContact: 'Телефон или электронная почта',
  fieldMessage: 'Сообщение',
  submit: 'Отправить сообщение',
  errorRequired: 'Заполните поле',
  topicHints: {
    visit: 'Тема: посещение шоурума',
    materials: 'Тема: запрос материалов',
    trade: 'Тема: сотрудничество',
  },
} as const

/** Hero ≥2400px; source ≠ about/trade (brand-baxter) */
export const contactListHero = {
  image: '/images/brand-molteni.jpg',
  objectPosition: '50% 42%',
} as const

/** Фото под «Контактная информация» — ≠ hero (molteni), без бренд-надписей */
export const contactAsideImage = {
  image: '/images/brand-baxter.jpg',
  objectPosition: '50% 48%',
  width: 5376,
  height: 3584,
} as const

export type ContactTopic = keyof typeof contactPageCopy.topicHints

/** Строки блока «Контактная информация» в порядке брифа */
export function getContactInfoRows(): SiteContact[] {
  const byKey = (needle: RegExp) =>
    contacts.find((item) => needle.test(item.label)) ?? null

  const phone = byKey(/телефон/i)
  const email = byKey(/email|почт/i)
  const address = byKey(/адрес/i)

  const rows: SiteContact[] = []
  if (phone) {
    rows.push({ ...phone, label: 'Телефон' })
  }
  if (email) {
    rows.push({ ...email, label: 'Электронная почта' })
  }
  if (address) {
    rows.push({ ...address, label: 'Адреса' })
  }
  return rows
}

export function isContactValueReady(item: SiteContact): boolean {
  const v = item.value?.trim() ?? ''
  if (!v) return false
  if (/^\[[^\]]+\]$/.test(v)) return false
  return item.status === 'approved'
}
