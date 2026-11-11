import type { InteriorSelection, ProductImageFocus } from '../types'

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
