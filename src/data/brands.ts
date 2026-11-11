import type { Brand, BrandAuthor, BrandCatalog } from '../types'

/**
 * Ровно четыре утверждённых бренда — docs/content-brief.md + этапы 9 / 9b.
 * Тексты /brands/<slug>/ — дословно из этапа 9b.
 * detailFocus (9e): src + фокус; без вшитого текста в кропе.
 */
const baseBrands: Brand[] = [
  {
    slug: 'visionnaire',
    name: 'Visionnaire',
    filter: 'Visionnaire',
    description:
      'Выразительные интерьерные коллекции с вниманием к композиции, материалам и деталям.',
    intro:
      'Выразительные интерьерные коллекции, в которых форма, материалы и детали создают цельный образ пространства.',
    about:
      'Visionnaire рассматривает мебель как часть общей интерьерной композиции. В центре внимания — силуэт предмета, характер отделки и взаимодействие элементов.',
    catalogText: 'Модели Visionnaire, представленные в каталоге ID Gallery.',
    collectionsLabel: 'Коллекции Visionnaire',
    collectionsText: 'Официальные коллекции производителя.',
    collectionsCta: 'Смотреть коллекции',
    requestText:
      'Уточните интересующую модель и исполнение у специалиста ID Gallery.',
    ctaLabel: 'Смотреть Visionnaire',
    logo: '/brand/logos/visionnaire.webp',
    heroImage: '/images/brand-visionnaire.jpg',
    image: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
    /* hero: листва / люстра; gemini (y≥40): обивка — без надписи Visionnaire */
    detailFocus: [
      { src: '/images/brand-visionnaire.jpg', x: 18, y: 52, zoom: 2.15 },
      { src: '/images/brand-visionnaire.jpg', x: 78, y: 18, zoom: 2.05 },
      {
        src: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
        x: 42,
        y: 78,
        zoom: 2.2,
      },
    ],
    collections: [],
    materials: [],
    authors: [],
    catalogs: [],
    status: 'approved',
  },
  {
    slug: 'molteni',
    name: 'Molteni&C',
    filter: 'Molteni&C',
    description:
      'Современная мебель с архитектурным подходом к пространству, пропорциям и функциональности.',
    intro:
      'Современная мебель с архитектурным подходом к пространству, пропорциям и функциональности.',
    about:
      'В коллекциях Molteni&C отдельные предметы и мебельные системы объединены вниманием к деталям и повседневным сценариям использования.',
    catalogText: 'Модели Molteni&C, представленные в каталоге ID Gallery.',
    collectionsLabel: 'Коллекции Molteni&C',
    collectionsText: 'Официальные коллекции и семейства производителя.',
    collectionsCta: 'Смотреть коллекции',
    requestText:
      'Получите информацию о модели, характеристиках и вариантах исполнения.',
    ctaLabel: 'Смотреть Molteni&C',
    logo: '/placeholders/brand.svg',
    heroImage: '/images/brand-molteni.jpg',
    image: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg',
    /* hero: диван / дрова; gemini низ: столы — без логотипа Molteni сверху */
    detailFocus: [
      { src: '/images/brand-molteni.jpg', x: 22, y: 72, zoom: 1.95 },
      { src: '/images/brand-molteni.jpg', x: 78, y: 48, zoom: 2.1 },
      {
        src: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg',
        x: 38,
        y: 82,
        zoom: 2.0,
      },
    ],
    collections: [],
    materials: [],
    authors: [],
    catalogs: [],
    status: 'approved',
  },
  {
    slug: 'baxter',
    name: 'Baxter',
    filter: 'Baxter',
    description:
      'Итальянская мебель, в которой материал, фактура и форма играют ключевую роль.',
    intro:
      'Итальянская мебель, в которой материал, фактура и форма играют ключевую роль.',
    about:
      'Baxter уделяет особое внимание выразительности поверхностей, цвету и тактильным свойствам материалов.',
    catalogText: 'Диваны, кресла и другие модели Baxter в каталоге ID Gallery.',
    collectionsLabel: 'Семейства Baxter',
    collectionsText: 'Связанные модели и официальные семейства производителя.',
    collectionsCta: 'Смотреть семейства',
    requestText:
      'Уточните доступные исполнения и материалы интересующей модели.',
    ctaLabel: 'Смотреть Baxter',
    logo: '/brand/logos/baxter.webp',
    heroImage: '/images/brand-baxter.jpg',
    image: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
    /* hero: обивка / лес в окне; gemini низ: стол — без надписи Baxter */
    detailFocus: [
      { src: '/images/brand-baxter.jpg', x: 35, y: 68, zoom: 2.05 },
      { src: '/images/brand-baxter.jpg', x: 88, y: 42, zoom: 1.85 },
      {
        src: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
        x: 48,
        y: 80,
        zoom: 2.15,
      },
    ],
    collections: [],
    materials: [],
    authors: [],
    catalogs: [],
    status: 'approved',
  },
  {
    slug: 'bonaldo',
    name: 'Bonaldo',
    filter: 'Bonaldo',
    description:
      'Современная мебель и освещение с выразительными формами и продуманными пропорциями.',
    intro:
      'Современная мебель и освещение с выразительными формами и продуманными пропорциями.',
    about:
      'Коллекции Bonaldo объединяют предметы для разных интерьерных пространств: от мебели до декоративного освещения.',
    catalogText: 'Модели Bonaldo, представленные в каталоге ID Gallery.',
    collectionsLabel: 'Коллекции Bonaldo',
    collectionsText: 'Официальные коллекции и семейства производителя.',
    collectionsCta: 'Смотреть коллекции',
    requestText:
      'Уточните исполнение, характеристики и условия предложения по выбранной модели.',
    ctaLabel: 'Смотреть Bonaldo',
    logo: '/brand/logos/bonaldo.webp',
    image: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
    /* только gemini с надписью сверху — все фокусы в нижних 60% */
    detailFocus: [
      {
        src: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
        x: 72,
        y: 78,
        zoom: 1.9,
      },
      {
        src: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
        x: 28,
        y: 70,
        zoom: 2.1,
      },
    ],
    collections: [],
    materials: [],
    authors: [],
    catalogs: [],
    status: 'approved',
  },
]

/** Лид страницы /brands/ — docs/content-brief «Все бренды» / этап 9 */
const demoEnabled = ['true', '1'].includes(
  String(import.meta.env?.VITE_DEMO_DATA ?? ''),
)

/* demoBrandContent.ts опционален (VITE_DEMO_DATA); без Vite-скриптов — пусто */
let demoModules: Record<
  string,
  {
    demoBrandContent: Record<
      string,
      { authors: BrandAuthor[]; catalogs: BrandCatalog[] }
    >
  }
> = {}
try {
  demoModules = import.meta.glob('./demoBrandContent.ts', { eager: true })
} catch {
  demoModules = {}
}
const demoContent = demoEnabled
  ? Object.assign({}, ...Object.values(demoModules).map((m) => m.demoBrandContent))
  : {}

/** Свои данные бренда важнее демо: демо подставляется только в пустые поля */
export const brands: Brand[] = baseBrands.map((brand) => {
  const demo = demoContent[brand.slug]
  if (!demo) return brand
  return {
    ...brand,
    authors: brand.authors?.length ? brand.authors : demo.authors,
    catalogs: brand.catalogs?.length ? brand.catalogs : demo.catalogs,
  }
})

export const brandsPage = {
  title: 'Бренды ID Gallery',
  lead:
    'Visionnaire, Molteni&C, Baxter и Bonaldo — четыре направления современного интерьерного дизайна.',
}
