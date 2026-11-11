import type { ProductImageFocus, ShowroomEntry } from '../types'

/**
 * Шоурумы — docs/content-brief.md §12.
 * Изображения — только approved из public/images/manifest.json.
 * Без выдуманных городов/адресов/часов (кроме шаблона […]).
 */

const CROP_BOTTOM_LEFT: ProductImageFocus = { x: 35, y: 80, zoom: 2.0 }
const CROP_BOTTOM_RIGHT: ProductImageFocus = { x: 65, y: 75, zoom: 1.9 }

export type { ShowroomEntry }

/** Копирайт страницы — только §12 */
export const showroomsCopy = {
  heroTitle: 'Шоурумы ID Gallery',
  heroLead:
    'Познакомьтесь с мебелью, материалами и образцами отделки в шоурумах. Возможность просмотра конкретной модели уточняйте перед визитом.',
  listLabel: 'Наши шоурумы',
  routeCta: 'Построить маршрут',
  photoCta: 'Показать фото',
  mapTitle: 'Карта',
  mapTemplate: '[Карта]',
  visitRowCta: 'Запросить посещение',
  /* шаблоны, пока нет подтверждённых данных (как «[Телефон]» на сайте) */
  addressTemplate: '[Адрес]',
  hoursTemplate: '[Часы работы]',
  phoneTemplate: '[Телефон]',
  visitTitle: 'Посещение',
  visitLead:
    'Укажите удобное время и интересующий бренд или модель. Мы свяжемся с вами для согласования визита.',
  visitCta: 'Запросить посещение',
  visitHref: '/request/?type=visit',
} as const

/**
 * Hero /showrooms/ — ≥2400px; не использовать в рядах и баннере «Посещение».
 */
export const showroomsListHero = {
  image: '/images/Gemini_Generated_Image_sq76gsq76gsq76gs.jpg',
  objectPosition: '50% 55%',
} as const

/** Фон баннера «Посещение» — отличный от hero и рядов */
export const showroomsVisitBanner = {
  image: '/images/brand-molteni.jpg',
  objectPosition: '50% 45%',
} as const

/**
 * Записи шоурумов. Пока нет approved — демо-ряды только при
 * featureFlags.showShowroomPlaceholders.
 */
/** Демо-карта: Яндекс.Карты (map-widget), центр города шоурума, масштаб 11 */
const DEMO_MAP_SRC =
  'https://yandex.ru/map-widget/v1/?ll=71.449100%2C51.169400&z=11&l=map'

export const showrooms: ShowroomEntry[] = [
  {
    slug: 'showroom-01',
    name: '[Название шоурума]',
    city: '[Город]',
    address: '',
    hours: '',
    phone: '',
    mapSrc: DEMO_MAP_SRC,
    /* не кроп hero (sq76); другой исходный кадр */
    image: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
    imageFocus: CROP_BOTTOM_LEFT,
    status: 'placeholder',
  },
  {
    slug: 'showroom-02',
    name: '[Название шоурума]',
    city: '[Город]',
    address: '',
    hours: '',
    phone: '',
    mapSrc: DEMO_MAP_SRC,
    image: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
    imageFocus: CROP_BOTTOM_RIGHT,
    status: 'placeholder',
  },
]
