import { brands } from './brands'
import { products } from './products'
import { showrooms } from './showrooms'

/**
 * /request/ — docs/content-brief.md §18.
 */

export const requestPageCopy = {
  heroTitle: 'Запросить предложение',
  heroLead: 'Укажите интересующую модель или задачу. Мы свяжемся с вами для уточнения деталей.',
  tabOffer: 'Запросить предложение',
  tabVisit: 'Запросить посещение',
  fieldName: 'Имя',
  fieldContact: 'Телефон или электронная почта',
  fieldModel: 'Интересующая модель',
  fieldComment: 'Комментарий',
  submit: 'Отправить запрос',
  errorRequired: 'Заполните поле',
  errorNeedModelOrComment: 'Укажите модель или комментарий',
} as const

export type RequestType = 'offer' | 'visit'

/** /request/?type=visit — «Запланировать консультацию» */
export const consultationCopy = {
  title: 'Запланировать консультацию',
  formatLabel: 'Формат консультации',
  formatShowroom: 'В шоуруме',
  formatOnline: 'Онлайн',
  fieldShowroom: 'Шоурум',
  showroomPlaceholder: 'Выберите шоурум',
  fieldDate: 'Предпочтительная дата',
  fieldTime: 'Предпочтительное время по Алматы',
  confirmNote: 'Команда подтвердит дату и время в переписке.',
  fieldName: 'Ваше имя',
  fieldContact: 'Как с вами связаться',
  itemsTitle: 'Предметы для обсуждения',
  variantPending: 'Исполнение уточняется',
  fieldComment: 'Комментарий',
  check: 'Проверить сообщение',
  previewTitle: 'Проверьте сообщение',
  linkNote: 'Ссылка на модель добавляется автоматически.',
  openWhatsApp: 'Открыть WhatsApp',
  copyText: 'Скопировать текст',
  copied: 'Текст скопирован',
  editData: 'Изменить данные',
  altTitle: 'Другой способ связи',
  altLead: 'Позвоните нам или отправьте сообщение по электронной почте.',
  call: 'Позвонить',
  email: 'Написать по почте',
  altNote: 'Используются проверенные контакты ID Gallery.',
  sentNote: 'Отправьте сообщение в WhatsApp, если ещё не сделали этого.',
  messageHello: 'Здравствуйте! Хочу записаться на консультацию.',
  errorContact: 'Укажите телефон или электронную почту',
  errorDatePast: 'Дата не раньше сегодня',
} as const

/** «Что вам нужно?» — пять направлений для каждой аудитории; общий блок запроса и записи */
export type ServiceAudience = 'private' | 'pro'

export type ServiceDirection = { label: string; hint: string }

export const serviceDirections: Record<
  ServiceAudience,
  { title: string; items: ServiceDirection[] }
> = {
  private: {
    title: 'Частному клиенту',
    items: [
      { label: 'Подбор мебели', hint: 'Подобрать отдельные предметы.' },
      { label: 'Меблировка и комплектация', hint: 'Укомплектовать комнату или весь интерьер.' },
      { label: 'Отделочные материалы', hint: 'Обои, краски, покрытия для пола и стеновые панели.' },
      { label: 'Освещение', hint: 'Подобрать светильники для помещения.' },
      { label: 'Помогите определиться', hint: 'Обсудим задачу и следующий шаг.' },
    ],
  },
  pro: {
    title: 'Дизайнеру и архитектору',
    items: [
      { label: 'Подбор по спецификации', hint: 'Подобрать модели и исполнения под проект.' },
      { label: 'Комплектация проекта', hint: 'Согласовать состав поставки по объекту.' },
      { label: 'Материалы и образцы', hint: 'Обои, краски, покрытия для пола и стеновые панели.' },
      {
        label: 'Освещение по проекту',
        hint: 'Подбор светильников по задачам и параметрам проекта.',
      },
      { label: 'Техническая документация', hint: 'Запросить чертежи и спецификации.' },
    ],
  },
}

/** Порядок выбранных — как в списке; при смене аудитории остаются только её пункты */
export function keepDirections(audience: ServiceAudience, value: string[]) {
  return serviceDirections[audience].items
    .map((item) => item.label)
    .filter((label) => value.includes(label))
}

export const serviceDirectionsCopy = {
  legend: 'Что вам нужно?',
  hint: 'Можно выбрать несколько пунктов.',
  placeholder: 'Выберите направления',
  messagePrefix: 'Что нужно',
} as const

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
export function productSuggestionLabel(brandSlug: string, productName: string): string {
  return `${brandName(brandSlug)} · ${productName}`
}

export function getModelSuggestions(): string[] {
  return products.map((p) => productSuggestionLabel(p.brandSlug, p.name))
}

export function labelForModelSlug(slug: string, variantId?: string | null): string | null {
  const product = products.find((p) => p.slug === slug)
  if (!product) return null
  const label = productSuggestionLabel(product.brandSlug, product.name)
  const finishes = [...(product.colors || []), ...(product.variants || [])]
  const variant = variantId ? finishes.find((item) => item.id === variantId) : null
  return variant?.name ? `${label} · ${variant.name}` : label
}

/** Несколько моделей (из подборки): «Baxter · Модель 02 · исполнение, Bonaldo · Модель 18» */
export function labelForModels(slugs: string[], variantIds: string[] = []): string | null {
  const labels = slugs
    .map((slug, index) => labelForModelSlug(slug, variantIds[index] || null))
    .filter(Boolean)
  return labels.length ? labels.join(', ') : null
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
