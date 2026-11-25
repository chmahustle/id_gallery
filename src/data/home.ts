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
  title: 'Мебель и интерьерные решения',
  subtitle: 'Visionnaire, Molteni&C, Baxter и Bonaldo',
  primaryCta: { label: 'Все товары', href: '/catalog' },
  secondaryCta: { label: 'По комнатам', href: '/rooms/' },
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
      'Посмотрите, как мебель, материалы и свет сочетаются в пространстве.',
    cta: { label: 'Смотреть интерьеры', href: '/interiors/' },
  },
  featured: {
    id: 'featured',
    title: 'По комнатам',
    description: 'Выберите комнату и посмотрите модели из каталога ID Gallery.',
    cta: { label: 'Все комнаты', href: '/rooms/' },
  },
  showrooms: {
    id: 'showrooms',
    title: 'Шоурумы',
    description:
      'Познакомьтесь с коллекциями и материалами лично. Наличие конкретной модели в экспозиции уточняется перед посещением.',
    cta: { label: 'Смотреть шоурумы', href: '/showrooms/' },
  },
  partners: {
    id: 'partners',
    title: 'Подбор и комплектация',
    cta: { label: 'Обсудить подбор', href: '/services/podbor' },
    tradeLink: { label: 'Для профессионалов', href: '/trade' },
  },
}

/** Разделы главной под первым экраном; порядок меняется в админке */
export type HomeSectionId = 'featured' | 'brands' | 'interiors' | 'partners' | 'showrooms'

export const homeSectionLabels: Record<HomeSectionId, string> = {
  featured: 'По комнатам',
  brands: 'Бренды',
  interiors: 'Интерьеры',
  partners: 'Подбор и комплектация',
  showrooms: 'Шоурумы',
}

export const homeLayout: { order: HomeSectionId[] } = {
  order: ['featured', 'brands', 'interiors', 'partners', 'showrooms'],
}

export const defaultHomeOrder: readonly HomeSectionId[] = [...homeLayout.order]

/** Задать порядок: только известные разделы, пропущенные — в конец */
export function setHomeOrder(list: unknown[]) {
  const known = Object.keys(homeSectionLabels) as HomeSectionId[]
  const order = list.filter((id): id is HomeSectionId => known.includes(id as HomeSectionId))
  homeLayout.order = [...new Set([...order, ...known])]
  return homeLayout.order
}

/** Порядок из админки (JSON-строка из базы) */
export function applyHomeOrder(raw: string) {
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) setHomeOrder(parsed)
  } catch {
    /* битое значение — остаётся порядок из кода */
  }
}

/**
 * «По комнатам»: товары, выбранные в админке для каждой комнаты (slug-и).
 * Пусто — блок берёт первые модели комнаты автоматически.
 */
export const homeFeaturedPicks: Record<string, string[]> = {}

export const FEATURED_COUNT = 4

export function setFeaturedPicks(value: unknown) {
  for (const key of Object.keys(homeFeaturedPicks)) delete homeFeaturedPicks[key]
  if (!value || typeof value !== 'object' || Array.isArray(value)) return homeFeaturedPicks
  for (const [room, list] of Object.entries(value as Record<string, unknown>)) {
    if (!Array.isArray(list)) continue
    const slugs = list.filter((slug): slug is string => typeof slug === 'string').slice(0, FEATURED_COUNT)
    if (slugs.length) homeFeaturedPicks[room] = slugs
  }
  return homeFeaturedPicks
}

/**
 * Полоса брендов под баннером «Бренды»: список из админки.
 * slug — бренд из каталога (название и ссылка берутся из него),
 * label + href — свой пункт. null — показываются все бренды.
 */
export type BrandStripItem = { slug?: string; label?: string; href?: string }

export const homeBrandStrip: { items: BrandStripItem[] | null } = { items: null }

export function setBrandStrip(value: unknown) {
  if (!Array.isArray(value)) {
    homeBrandStrip.items = null
    return null
  }
  const items = value
    .filter((item): item is BrandStripItem => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      ...(typeof item.slug === 'string' && item.slug ? { slug: item.slug } : {}),
      ...(typeof item.label === 'string' && item.label.trim() ? { label: item.label.trim() } : {}),
      ...(typeof item.href === 'string' && item.href.trim() ? { href: item.href.trim() } : {}),
    }))
    .filter((item) => item.slug || (item.label && item.href))
  homeBrandStrip.items = items
  return items
}
