import type {
  InteriorHotspot,
  InteriorOrigin,
  InteriorSelection,
  ProductImageFocus,
} from '../types'

/**
 * Демо-данные интерьеров: привязка существующих интерьеров к брендам и три
 * дополнительных демо-интерьера. Подключаются только при VITE_DEMO_DATA=true
 * (см. interiors.ts и README); чтобы убрать — выключить переменную или
 * удалить этот файл. Кадры — без логотипов и надписей.
 */

const CROP_MID: ProductImageFocus = { x: 50, y: 60, zoom: 1.6 }
const CROP_LOW: ProductImageFocus = { x: 50, y: 70, zoom: 1.6 }

/** Бренды существующих интерьеров (6 интерьеров на бренд) */
const ALL_BRANDS = ['visionnaire', 'molteni', 'baxter', 'bonaldo']

export const demoInteriorBrands: Record<string, string[]> = {
  gostinaya: ALL_BRANDS,
  stolovaya: ALL_BRANDS,
  'gostinaya-svetlaya': ALL_BRANDS,
}

/**
 * Демо-происхождение и подтверждённые модели — показать заказчику, как это будет
 * выглядеть. Имён не выдумываем: автор «ФИО», источник «Источник фото».
 */
export const demoInteriorOrigins: Record<string, InteriorOrigin> = {
  gostinaya: { kind: 'brand', brand: 'baxter', photoSource: 'Источник фото' },
  stolovaya: { kind: 'brand', brand: 'molteni', photoSource: 'Источник фото' },
  'gostinaya-svetlaya': { kind: 'gallery', author: 'ФИО', photoSource: 'Источник фото' },
  kabinet: { kind: 'gallery', author: 'ФИО', photoSource: 'Источник фото' },
  terrasa: { kind: 'brand', brand: 'bonaldo', photoSource: 'Источник фото' },
  'gostinaya-zelenaya': { kind: 'brand', brand: 'visionnaire', photoSource: 'Источник фото' },
}

/**
 * Демо-точки на сценах: расставлены по предметам на кадре, товары — из productIds.
 * cropTop скрывает вшитое название бренда вверху кадра.
 */
export const demoInteriorScenes: Record<
  string,
  { hotspots: InteriorHotspot[]; cropTop?: number }
> = {
  gostinaya: {
    cropTop: 22,
    hotspots: [
      { product: 'model-02-sofa', x: 67, y: 64 },
      { product: 'model-11-armchair', x: 25, y: 79 },
    ],
  },
  stolovaya: {
    cropTop: 22,
    hotspots: [
      { product: 'model-13-table', x: 64, y: 64 },
      { product: 'model-12-chair', x: 29, y: 77 },
      { product: 'model-04-chair', x: 82, y: 75 },
    ],
  },
  'gostinaya-svetlaya': {
    cropTop: 22,
    hotspots: [
      { product: 'model-06-sofa', x: 39, y: 66 },
      { product: 'model-07-armchair', x: 86, y: 60 },
    ],
  },
  kabinet: {
    hotspots: [
      { product: 'model-15-armchair', x: 70, y: 69 },
      { product: 'model-19-armchair', x: 15, y: 75 },
      { product: 'model-31-storage', x: 59, y: 85 },
    ],
  },
  terrasa: {
    hotspots: [
      { product: 'model-22-sofa', x: 38, y: 65 },
      { product: 'model-26-table', x: 66, y: 70 },
    ],
  },
  'gostinaya-zelenaya': {
    hotspots: [
      { product: 'model-16-sofa', x: 50, y: 60 },
      { product: 'model-20-armchair', x: 22, y: 78 },
    ],
  },
}

export const demoInteriors: InteriorSelection[] = [
  {
    slug: 'kabinet',
    title: 'Кабинет',
    caption: 'Кресло и свет для рабочей зоны.',
    image: '/images/partners.jpg',
    imageFocus: CROP_MID,
    productIds: ['model-15-armchair', 'model-19-armchair', 'model-31-storage'],
    room: 'kabinet',
    brands: ALL_BRANDS,
    demo: true,
    status: 'placeholder',
  },
  {
    slug: 'terrasa',
    title: 'Терраса и сад',
    caption: 'Мягкая мебель для террасы.',
    image: '/images/hero.jpg',
    imageFocus: CROP_LOW,
    productIds: ['model-22-sofa', 'model-26-table'],
    room: 'terrasa-sad',
    brands: ALL_BRANDS,
    demo: true,
    status: 'placeholder',
  },
  {
    slug: 'gostinaya-zelenaya',
    title: 'Гостиная в зелёной палитре',
    caption: 'Глубокие тона для гостиной зоны.',
    image: '/images/interior-01.png',
    imageFocus: CROP_MID,
    productIds: ['model-16-sofa', 'model-17-sofa', 'model-20-armchair'],
    room: 'gostinaya',
    brands: ALL_BRANDS,
    demo: true,
    status: 'placeholder',
  },
]
