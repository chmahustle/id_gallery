import type { ContentStatus } from '../types'

/** Тексты и слайды главной — docs/content-brief.md §02 + этап 6d */

export type HeroSlide = {
  id: string
  /** Базовый путь без суффикса ширины; srcset собирается в Hero */
  image: string
  sources?: { srcSet: string; type?: string; sizes?: string }[]
  srcSet?: string
  sizes?: string
  alt: string
  /** CSS object-position, напр. 'left center' | '50% 70%' */
  objectPosition?: string
  status?: ContentStatus
}

export type HomeBannerImage = {
  /** Absent → Placeholder (нет утверждённого кадра) */
  src?: string
  srcSet?: string
  objectPosition?: string
}

/** srcset: один файл на несколько ширин, пока нет отдельных webp */
function bannerSrcSet(src: string) {
  return `${src} 1280w, ${src} 1920w, ${src} 2560w`
}

export const homeMeta = {
  title: 'ID Gallery — мебель и интерьерные решения',
  description:
    'Итальянская мебель и освещение в Казахстане. Запрос предложения и запись на визит.',
}

export const homeHero = {
  label: 'ID GALLERY',
  title: 'ID Gallery',
  subtitle:
    'Мебель и интерьерные решения Visionnaire, Molteni&C, Baxter и Bonaldo.',
  primaryCta: { label: 'Все товары', href: '/catalog' },
  secondaryCta: { label: 'Бренды', href: '/brands' },
}

export const homeHeroSlides: HeroSlide[] = [
  {
    id: 'hero-main',
    image: '/images/Gemini_Generated_Image_sq76gsq76gsq76gs.jpg',
    sizes: '100vw',
    alt: 'Гостиная с мягкой мебелью и тёплым вечерним светом',
    objectPosition: '28% 55%',
    status: 'approved',
  },
]

/** Кадры баннеров главной (между страницами дубли с /brands допустимы) */
export const homeBannerImages = {
  brands: {
    src: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
    srcSet: bannerSrcSet(
      '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
    ),
    objectPosition: '50% 42%',
  } satisfies HomeBannerImage,
  catalog: {
    src: '/images/interior-01.png',
    srcSet: bannerSrcSet('/images/interior-01.png'),
    objectPosition: '50% 38%',
  } satisfies HomeBannerImage,
  interiors: {
    src: '/images/interior-03.png',
    srcSet: bannerSrcSet('/images/interior-03.png'),
    objectPosition: '50% 40%',
  } satisfies HomeBannerImage,
  showrooms: {
    src: '/images/hero.jpg',
    srcSet: bannerSrcSet('/images/hero.jpg'),
    objectPosition: '50% 55%',
  } satisfies HomeBannerImage,
  partners: {
    // замена кадра с вшитым «Baxter»; partners.jpg без чужих брендов
    src: '/images/partners.jpg',
    srcSet: bannerSrcSet('/images/partners.jpg'),
    objectPosition: '50% 45%',
  } satisfies HomeBannerImage,
}

export const homeSections = {
  brands: {
    id: 'brands',
    title: 'Бренды ID Gallery',
    description:
      'Четыре производителя с собственным подходом к форме, материалам и интерьеру.',
    cta: { label: 'Все бренды', href: '/brands' },
  },
  catalog: {
    id: 'catalog',
    title: 'Каталог',
    description: 'Мебель и освещение по категориям и производителям.',
    cta: { label: 'Перейти в каталог', href: '/catalog' },
  },
  interiors: {
    id: 'interiors',
    title: 'Интерьеры',
    description:
      'Идеи сочетания мебели, материалов и освещения для разных пространств.',
    cta: { label: 'Смотреть интерьеры', href: '/interiors/' },
  },
  featured: {
    id: 'featured',
    title: 'Предметы для вашего пространства',
    description: 'Выберите комнату и посмотрите модели из каталога ID Gallery.',
    cta: { label: 'Все товары', href: '/catalog' },
  },
  showrooms: {
    id: 'showrooms',
    title: 'Шоурумы',
    description:
      'Познакомьтесь с коллекциями и материалами лично. Наличие конкретной модели в экспозиции уточняется перед посещением.',
    cta: { label: 'Шоурумы', href: '/showrooms/' },
  },
  partners: {
    id: 'partners',
    title: 'Дизайнерам и архитекторам',
    description:
      'Подбор моделей для проектов и запрос технической информации у команды ID Gallery.',
    cta: { label: 'Сотрудничество', href: '/trade' },
    clientCta: { label: 'Подбор и комплектация', href: '/request/' },
  },
}
