import type { Showroom, SiteContent } from '../types'

/** Сайт и контакты — docs/content-brief.md §09 */
export const site: SiteContent = {
  name: 'ID Gallery',
  tagline: 'Интерьерный формат Idea Decor',
  description:
    'Итальянская мебель и освещение в Казахстане. Запрос предложения и запись на визит.',
  locale: 'Казахстан',
  cta: {
    requestOffer: 'Запросить предложение',
    bookVisit: 'Записаться на визит',
    toCatalog: 'В каталог',
    allBrands: 'Все бренды',
    priceOnRequest: 'Стоимость — по запросу',
  },
  legal: {
    privacyLabel: 'Политика конфиденциальности',
    privacyHref: '/contacts',
    termsLabel: 'Условия использования',
    termsHref: '/contacts',
    /** Юридические ссылки скрыты, пока тексты не утверждены */
    hidden: true,
  },
  contacts: [
    {
      label: 'Телефон',
      value: '[Телефон]',
      status: 'placeholder',
    },
    {
      label: 'Электронная почта',
      value: '[Email]',
      status: 'placeholder',
    },
    {
      label: 'Адреса',
      value: '[Адрес]',
      status: 'placeholder',
    },
  ],
  status: 'placeholder',
}

export const showrooms: Showroom[] = [
  {
    city: '[Город]',
    address: '[Адрес]',
    status: 'placeholder',
  },
  {
    city: '[Город]',
    address: '[Адрес]',
    status: 'placeholder',
  },
]
