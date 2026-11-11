import type { ProductImageFocus } from '../types'

/**
 * /trade/ — docs/content-brief.md §13.
 * Изображения — approved из manifest; 4 разных sourceId на странице.
 */

const CROP_BOTTOM_LEFT: ProductImageFocus = { x: 38, y: 72, zoom: 1.9 }
const CROP_BOTTOM_RIGHT: ProductImageFocus = { x: 62, y: 76, zoom: 1.95 }

export const tradeCopy = {
  heroTitle: 'Профессионалам',
  /** Вступление под H1; когда клиент пришлёт текст — меняется только оно */
  intro:
    'Подбор мебели и освещения для интерьерных проектов, информация о моделях и запрос технических материалов.',
  coopTitle: 'Сотрудничество',
  coopLead:
    'Оставьте информацию о себе и вашем бюро, чтобы обсудить возможный формат работы.',
  coopCta: 'Обсудить сотрудничество',
  coopHref: '/contact/?topic=trade',
} as const

/** Hero ≥2400px; не повторять в карточках и баннере */
export const tradeListHero = {
  image: '/images/brand-baxter.jpg',
  objectPosition: '50% 48%',
} as const

export const tradeCoopBanner = {
  image: '/images/brand-molteni.jpg',
  objectPosition: '50% 42%',
} as const

export type TradeCard = {
  id: string
  title: string
  text: string
  /** Кнопка карточки; без неё карточка только с текстом */
  cta?: string
  href?: string
  image: string
  imageFocus: ProductImageFocus
  demo?: boolean
}

export const tradeCards: TradeCard[] = [
  {
    id: 'models',
    title: 'Модели для проекта',
    text: 'Выберите предметы в каталоге и направьте запрос по интересующим позициям.',
    cta: 'Открыть каталог',
    href: '/catalog/',
    image: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg',
    imageFocus: CROP_BOTTOM_LEFT,
  },
  {
    id: 'materials',
    title: 'Техническая информация',
    text: 'Уточните наличие каталогов, чертежей и материалов для проектирования по конкретным моделям.',
    cta: 'Запросить материалы',
    href: '/contact/?topic=materials',
    image: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
    imageFocus: CROP_BOTTOM_RIGHT,
  },
]

/** Текстовый блок после hero (заглушка, demo: true) */
export const tradeIntroBlock = {
  text: 'Текст вступления: кому подходит сотрудничество, что делает галерея, как начать.',
  demo: true,
} as const

/** Блоки «Дизайнерам и архитекторам» и «Девелоперам»: тексты-заглушки (demo: true) */
export const tradeDesigners = {
  title: 'Дизайнерам и архитекторам',
} as const

const CROP_MID: ProductImageFocus = { x: 50, y: 60, zoom: 1.6 }

/** Карточки блока «Девелоперам»: тексты и фото — заглушки (demo: true) */
export const tradeDevelopers = {
  title: 'Девелоперам',
  cards: [
    {
      id: 'objects',
      title: 'Типы объектов',
      text: 'Текст: описание.',
      image: '/images/interior-03.png',
      imageFocus: CROP_MID,
      demo: true,
    },
    {
      id: 'tasks',
      title: 'Задачи комплектации',
      text: 'Текст: описание.',
      image: '/images/hero.jpg',
      imageFocus: CROP_MID,
      demo: true,
    },
    {
      id: 'contact',
      title: 'Контакт',
      text: 'Текст: описание.',
      cta: 'Обсудить сотрудничество',
      /** Тема заявки: форма — отдельный шаг, пока тема передаётся параметром */
      href: '/request/?type=offer&topic=developers',
      image: '/images/partners.jpg',
      imageFocus: CROP_MID,
      demo: true,
    },
  ] satisfies TradeCard[],
} as const
