import type { ProductImageFocus } from '../types'

/**
 * /about/ — docs/content-brief.md §14.
 * Изображения — approved; hero и «Наш подход» — разные sourceId.
 */

const CROP_APPROACH: ProductImageFocus = { x: 45, y: 72, zoom: 1.85 }

export const aboutCopy = {
  heroTitle: 'Об ID Gallery',
  heroLead:
    'ID Gallery — интерьерный формат Idea Decor, объединяющий мебель и предметы интерьера нескольких производителей.',
  approachLabel: 'Наш подход',
  approachText:
    'Мы помогаем ориентироваться в ассортименте производителей и выбирать предметы с учётом особенностей конкретного пространства.',
  approachCta: 'Смотреть каталог',
  approachHref: '/catalog/',
  brandsLabel: 'Бренды',
  brandsCta: 'Открыть бренды',
  brandsHref: '/brands/',
} as const

/** Hero ≥2400px */
export const aboutListHero = {
  image: '/images/brand-baxter.jpg',
  objectPosition: '50% 45%',
} as const

/** Фото блока «Наш подход» — другой sourceId */
export const aboutApproach = {
  image: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
  imageFocus: CROP_APPROACH,
} as const
