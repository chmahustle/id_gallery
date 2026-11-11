/**
 * Совместимый слой контента. Списки брендов / категорий / товаров / меню —
 * только из src/data (через fromData).
 */
import {
  site,
  contacts,
  contactsPage,
  mainNav,
  catalogCategories,
  brandLogos,
  products,
  menuColumns,
} from './content/fromData.js'
import { site as siteData } from './data/site'

export {
  site,
  contacts,
  contactsPage,
  mainNav,
  catalogCategories,
  brandLogos,
  products,
  menuColumns,
}

/** @deprecated */
export const furnitureSubcategories = []

export const productFilters = []

export const promoSlides = [
  {
    id: 'collections',
    title: 'Коллекции в экспозиции',
    text: 'Мебель и свет — смотрите в шоурумах ID Gallery.',
    cta: siteData.cta.toCatalog,
    href: '/catalog',
    image: '/images/hero.jpg',
  },
  {
    id: 'tour',
    title: 'Персональная экскурсия',
    text: 'Запишитесь на визит: подберём решения под ваш проект.',
    cta: siteData.cta.bookVisit,
    href: '/contacts',
    image: '/placeholders/product-02.jpg',
  },
  {
    id: 'brands',
    title: 'Бренды ID Gallery',
    text: 'Visionnaire, Molteni&C, Baxter и Bonaldo.',
    cta: siteData.cta.allBrands,
    href: '/brands',
    image: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
  },
]

/** Краткий тизер для legacy-блоков; полный текст — data/about.ts §14 */
export const about = {
  title: 'Об ID Gallery',
  lead: 'ID Gallery — интерьерный формат Idea Decor, объединяющий мебель и предметы интерьера нескольких производителей.',
  cta: 'Подробнее',
  href: '/about',
  image: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
}

export const advantages = [
  {
    title: 'Шоурумы',
    text: 'Экспозиции мебели и света в формате интерьерных зон.',
    href: '/contacts',
  },
  {
    title: 'Каталог',
    text: 'Позиции четырёх брендов с запросом предложения.',
    href: '/catalog',
  },
  {
    title: 'Консультация',
    text: 'Помощь в подборе решений под ваш проект.',
    href: '/contacts',
  },
  {
    title: 'Дизайнерам',
    text: 'Сопровождение архитекторов и дизайнеров.',
    href: '/trade',
  },
]

export const showrooms = [
  { title: 'Гостиные и мягкая мебель', image: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg' },
  { title: 'Столы и хранение', image: '/placeholders/product-02.jpg' },
  { title: 'Освещение', image: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg' },
]

export const services = [
  {
    title: 'Персональная экскурсия',
    text: 'Визит в шоурум с консультацией по экспозиции.',
  },
  {
    title: 'Коммерческое предложение',
    text: 'Запрос стоимости и комплектации по выбранным позициям.',
  },
  {
    title: 'Сопровождение проектов',
    text: 'Поддержка дизайнеров от подбора до поставки.',
  },
]

export const newsCategories = []

/** Пустой список: раздел событий выключен флагом showNews */
export const news = []
export const newsItems = news

export function newsPath(slug) {
  return `/news/${slug}`
}

export function getNewsBySlug(slug, list = news) {
  return list.find((item) => item.slug === slug) || null
}

export function getAdjacentNews(slug, list = news) {
  const index = list.findIndex((item) => item.slug === slug)
  if (index < 0) return { prev: null, next: null }
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  }
}

export function toIsoDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export const searchIndex = [
  ...mainNav.map((item) => ({
    title: item.label,
    type: 'Раздел',
    href: item.href,
    keywords: item.label,
  })),
  ...catalogCategories.map((cat) => ({
    title: cat.label,
    type: 'Категория',
    href: cat.href,
    keywords: cat.label,
  })),
  ...brandLogos.map((item) => ({
    title: item.name,
    type: 'Бренд',
    href: `/brands/${item.slug || ''}`,
    keywords: `${item.name} ${item.filter}`,
  })),
  ...products.map((item) => ({
    title: item.name,
    type: 'Товар',
    href: `/product/${item.slug}`,
    keywords: `${item.name} ${item.brand} ${item.category}`,
  })),
]

export function searchSite(query) {
  const q = String(query || '')
    .trim()
    .toLowerCase()
  if (!q) return []
  return searchIndex.filter((item) => {
    const hay = `${item.title} ${item.keywords} ${item.type}`.toLowerCase()
    return hay.includes(q)
  })
}

export function buildContentPayload() {
  return {
    site,
    contacts,
    mainNav,
    catalogCategories,
    brandLogos,
    products,
  }
}

export const header = {
  utility: [
    { label: 'Дизайнерам', href: '/trade' },
    { label: 'Контакты', href: '/contacts' },
  ],
  links: mainNav,
}

export const footer = {
  columns: [
    {
      title: 'Меню',
      links: [
        { label: 'Каталог', href: '/catalog' },
        { label: 'Бренды', href: '/brands' },
        { label: 'Интерьеры', href: '/interiors/' },
      ],
    },
    {
      title: 'О галерее',
      links: [
        { label: 'Дизайнерам', href: '/trade' },
        { label: 'О галерее', href: '/about' },
        { label: 'Контакты', href: '/contacts' },
      ],
    },
  ],
}
