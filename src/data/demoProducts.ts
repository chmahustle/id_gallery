import type { Product, ProductCharacteristics } from '../types'
import { demoFinishSamples } from './finishes'

/**
 * Демонстрационные товары (по 9 на бренд, сквозная нумерация «Модель NN»).
 * Подключаются только при VITE_DEMO_DATA=true (см. products.ts и README).
 * Чтобы убрать демо: выключить переменную или удалить этот файл.
 *
 * Фото — только кадры без логотипов и надписей (не обложки брендов):
 * повторы допустимы, но соседние товары в подборке не делят кадр.
 * Комнаты привязаны по смыслу категории; цен нет.
 */

const IMG = {
  livingGreen: '/images/interior-01.png',
  livingWarm: '/images/Gemini_Generated_Image_sq76gsq76gsq76gs.jpg',
  diningLamps: '/images/interior-03.png',
  terraceSofa: '/images/hero.jpg',
  armchairScreen: '/images/partners.jpg',
  tableDetail: '/placeholders/product-02.jpg',
  outdoorSet: '/placeholders/product-10.jpg',
} as const

const KEY = {
  A: IMG.livingGreen,
  B: IMG.livingWarm,
  C: IMG.diningLamps,
  D: IMG.terraceSofa,
  E: IMG.armchairScreen,
  F: IMG.tableDetail,
  G: IMG.outdoorSet,
} as const

function chars(): ProductCharacteristics {
  return {
    dimensions: { value: '240 × 105 × 80 см', status: 'placeholder' },
    materials: { value: 'Кожа, массив дерева', status: 'placeholder' },
    finishes: { value: 'Образец A, Образец B', status: 'placeholder' },
    sku: { value: 'BX-0211', status: 'placeholder' },
  }
}

type Row = {
  num: number
  type: 'sofa' | 'armchair' | 'table' | 'chair' | 'storage' | 'light'
  brand: string
  brandSlug: string
  category: string
  categorySlug: string
  genitive: string
  frames: (keyof typeof KEY)[]
  popularity: number
  rooms: string[]
}

const ROWS: Row[] = [
  { num: 1, type: 'sofa', brand: 'Visionnaire', brandSlug: 'visionnaire', category: 'Диваны', categorySlug: 'divany', genitive: 'дивана', frames: ['G', 'A', 'B'], popularity: 96, rooms: ['gostinaya'] },
  { num: 2, type: 'sofa', brand: 'Baxter', brandSlug: 'baxter', category: 'Диваны', categorySlug: 'divany', genitive: 'дивана', frames: ['B', 'A', 'D'], popularity: 96, rooms: ['gostinaya'] },
  { num: 3, type: 'armchair', brand: 'Bonaldo', brandSlug: 'bonaldo', category: 'Кресла', categorySlug: 'kresla', genitive: 'кресла', frames: ['E', 'B', 'G'], popularity: 96, rooms: ['gostinaya', 'kabinet'] },
  { num: 4, type: 'chair', brand: 'Molteni&C', brandSlug: 'molteni', category: 'Стулья', categorySlug: 'stulya', genitive: 'стула', frames: ['F', 'C', 'E'], popularity: 96, rooms: ['stolovaya', 'kuhnya'] },
  { num: 5, type: 'table', brand: 'Molteni&C', brandSlug: 'molteni', category: 'Столы', categorySlug: 'stoly', genitive: 'стола', frames: ['D', 'C', 'F'], popularity: 92, rooms: ['stolovaya', 'gostinaya'] },
  { num: 6, type: 'sofa', brand: 'Visionnaire', brandSlug: 'visionnaire', category: 'Диваны', categorySlug: 'divany', genitive: 'дивана', frames: ['A', 'B', 'D'], popularity: 92, rooms: ['gostinaya'] },
  { num: 7, type: 'armchair', brand: 'Molteni&C', brandSlug: 'molteni', category: 'Кресла', categorySlug: 'kresla', genitive: 'кресла', frames: ['G', 'E', 'B'], popularity: 88, rooms: ['gostinaya', 'kabinet'] },
  { num: 8, type: 'storage', brand: 'Bonaldo', brandSlug: 'bonaldo', category: 'Хранение', categorySlug: 'hranenie', genitive: 'предмета хранения', frames: ['A', 'B', 'F'], popularity: 92, rooms: ['gostinaya', 'kabinet', 'garderobnaya'] },
  { num: 9, type: 'light', brand: 'Baxter', brandSlug: 'baxter', category: 'Освещение', categorySlug: 'osveshchenie', genitive: 'светильника', frames: ['E', 'C', 'A'], popularity: 92, rooms: ['gostinaya', 'spalnya', 'detskaya', 'vannaya', 'terrasa-sad'] },
  { num: 10, type: 'light', brand: 'Visionnaire', brandSlug: 'visionnaire', category: 'Освещение', categorySlug: 'osveshchenie', genitive: 'светильника', frames: ['C', 'E', 'A'], popularity: 88, rooms: ['gostinaya', 'spalnya', 'detskaya', 'vannaya', 'terrasa-sad'] },
  { num: 11, type: 'armchair', brand: 'Baxter', brandSlug: 'baxter', category: 'Кресла', categorySlug: 'kresla', genitive: 'кресла', frames: ['A', 'E', 'B'], popularity: 88, rooms: ['gostinaya', 'kabinet'] },
  { num: 12, type: 'chair', brand: 'Bonaldo', brandSlug: 'bonaldo', category: 'Стулья', categorySlug: 'stulya', genitive: 'стула', frames: ['F', 'C', 'E'], popularity: 88, rooms: ['stolovaya', 'kuhnya'] },
  { num: 13, type: 'table', brand: 'Baxter', brandSlug: 'baxter', category: 'Столы', categorySlug: 'stoly', genitive: 'стола', frames: ['D', 'C', 'F'], popularity: 84, rooms: ['stolovaya', 'gostinaya'] },
  { num: 14, type: 'storage', brand: 'Baxter', brandSlug: 'baxter', category: 'Хранение', categorySlug: 'hranenie', genitive: 'предмета хранения', frames: ['F', 'B', 'A'], popularity: 80, rooms: ['gostinaya', 'kabinet', 'garderobnaya'] },
  { num: 15, type: 'armchair', brand: 'Visionnaire', brandSlug: 'visionnaire', category: 'Кресла', categorySlug: 'kresla', genitive: 'кресла', frames: ['B', 'E', 'G'], popularity: 84, rooms: ['gostinaya', 'kabinet'] },
  { num: 16, type: 'sofa', brand: 'Baxter', brandSlug: 'baxter', category: 'Диваны', categorySlug: 'divany', genitive: 'дивана', frames: ['G', 'A', 'B'], popularity: 76, rooms: ['gostinaya'] },
  { num: 17, type: 'sofa', brand: 'Molteni&C', brandSlug: 'molteni', category: 'Диваны', categorySlug: 'divany', genitive: 'дивана', frames: ['B', 'A', 'D'], popularity: 84, rooms: ['gostinaya'] },
  { num: 18, type: 'sofa', brand: 'Bonaldo', brandSlug: 'bonaldo', category: 'Диваны', categorySlug: 'divany', genitive: 'дивана', frames: ['D', 'A', 'B'], popularity: 84, rooms: ['gostinaya'] },
  { num: 19, type: 'armchair', brand: 'Visionnaire', brandSlug: 'visionnaire', category: 'Кресла', categorySlug: 'kresla', genitive: 'кресла', frames: ['E', 'B', 'G'], popularity: 80, rooms: ['gostinaya', 'spalnya'] },
  { num: 20, type: 'armchair', brand: 'Baxter', brandSlug: 'baxter', category: 'Кресла', categorySlug: 'kresla', genitive: 'кресла', frames: ['B', 'E', 'G'], popularity: 72, rooms: ['gostinaya', 'spalnya'] },
  { num: 21, type: 'sofa', brand: 'Molteni&C', brandSlug: 'molteni', category: 'Диваны', categorySlug: 'divany', genitive: 'дивана', frames: ['A', 'B', 'D'], popularity: 80, rooms: ['gostinaya'] },
  { num: 22, type: 'sofa', brand: 'Bonaldo', brandSlug: 'bonaldo', category: 'Диваны', categorySlug: 'divany', genitive: 'дивана', frames: ['G', 'A', 'B'], popularity: 80, rooms: ['gostinaya'] },
  { num: 23, type: 'table', brand: 'Visionnaire', brandSlug: 'visionnaire', category: 'Столы', categorySlug: 'stoly', genitive: 'стола', frames: ['C', 'F', 'D'], popularity: 76, rooms: ['stolovaya', 'gostinaya'] },
  { num: 24, type: 'chair', brand: 'Baxter', brandSlug: 'baxter', category: 'Стулья', categorySlug: 'stulya', genitive: 'стула', frames: ['F', 'C', 'E'], popularity: 68, rooms: ['stolovaya', 'kuhnya'] },
  { num: 25, type: 'armchair', brand: 'Molteni&C', brandSlug: 'molteni', category: 'Кресла', categorySlug: 'kresla', genitive: 'кресла', frames: ['E', 'B', 'G'], popularity: 76, rooms: ['gostinaya', 'spalnya'] },
  { num: 26, type: 'table', brand: 'Bonaldo', brandSlug: 'bonaldo', category: 'Столы', categorySlug: 'stoly', genitive: 'стола', frames: ['C', 'F', 'D'], popularity: 76, rooms: ['stolovaya', 'gostinaya'] },
  { num: 27, type: 'chair', brand: 'Visionnaire', brandSlug: 'visionnaire', category: 'Стулья', categorySlug: 'stulya', genitive: 'стула', frames: ['F', 'C', 'E'], popularity: 72, rooms: ['stolovaya', 'kuhnya'] },
  { num: 28, type: 'light', brand: 'Baxter', brandSlug: 'baxter', category: 'Освещение', categorySlug: 'osveshchenie', genitive: 'светильника', frames: ['C', 'E', 'A'], popularity: 64, rooms: ['stolovaya', 'kuhnya', 'kabinet', 'garderobnaya', 'detskaya', 'vannaya', 'terrasa-sad'] },
  { num: 29, type: 'storage', brand: 'Molteni&C', brandSlug: 'molteni', category: 'Хранение', categorySlug: 'hranenie', genitive: 'предмета хранения', frames: ['B', 'A', 'F'], popularity: 72, rooms: ['gostinaya', 'kabinet', 'garderobnaya'] },
  { num: 30, type: 'table', brand: 'Bonaldo', brandSlug: 'bonaldo', category: 'Столы', categorySlug: 'stoly', genitive: 'стола', frames: ['D', 'C', 'F'], popularity: 72, rooms: ['stolovaya'] },
  { num: 31, type: 'storage', brand: 'Visionnaire', brandSlug: 'visionnaire', category: 'Хранение', categorySlug: 'hranenie', genitive: 'предмета хранения', frames: ['A', 'B', 'F'], popularity: 68, rooms: ['gostinaya', 'kabinet', 'garderobnaya'] },
  { num: 32, type: 'light', brand: 'Molteni&C', brandSlug: 'molteni', category: 'Освещение', categorySlug: 'osveshchenie', genitive: 'светильника', frames: ['C', 'E', 'A'], popularity: 68, rooms: ['gostinaya', 'spalnya', 'detskaya', 'vannaya', 'terrasa-sad'] },
  { num: 33, type: 'light', brand: 'Bonaldo', brandSlug: 'bonaldo', category: 'Освещение', categorySlug: 'osveshchenie', genitive: 'светильника', frames: ['E', 'C', 'A'], popularity: 68, rooms: ['gostinaya', 'spalnya', 'detskaya', 'vannaya', 'terrasa-sad'] },
  { num: 34, type: 'light', brand: 'Visionnaire', brandSlug: 'visionnaire', category: 'Освещение', categorySlug: 'osveshchenie', genitive: 'светильника', frames: ['B', 'C', 'E'], popularity: 64, rooms: ['stolovaya', 'kuhnya', 'kabinet', 'garderobnaya', 'detskaya', 'vannaya', 'terrasa-sad'] },
  { num: 35, type: 'light', brand: 'Molteni&C', brandSlug: 'molteni', category: 'Освещение', categorySlug: 'osveshchenie', genitive: 'светильника', frames: ['A', 'C', 'E'], popularity: 64, rooms: ['stolovaya', 'kuhnya', 'kabinet', 'garderobnaya', 'detskaya', 'vannaya', 'terrasa-sad'] },
  { num: 36, type: 'light', brand: 'Bonaldo', brandSlug: 'bonaldo', category: 'Освещение', categorySlug: 'osveshchenie', genitive: 'светильника', frames: ['C', 'E', 'A'], popularity: 64, rooms: ['stolovaya', 'kuhnya', 'kabinet', 'garderobnaya', 'detskaya', 'vannaya', 'terrasa-sad'] },
]

export const demoProducts: Product[] = ROWS.map((row) => {
  const nn = String(row.num).padStart(2, '0')
  const images = row.frames.map((key) => KEY[key])
  return {
    slug: `model-${nn}-${row.type}`,
    brand: row.brand,
    brandSlug: row.brandSlug,
    name: `Модель ${nn}`,
    category: row.category,
    categorySlug: row.categorySlug,
    subcategory: row.category,
    shortDescription: `Демонстрационная модель ${row.genitive} для оформления каталога.`,
    characteristics: chars(),
    images,
    image: images[0]!,
    variants: demoFinishSamples(`m${nn}`),
    rooms: row.rooms,
    // автор, документы и уход — у всех демо-товаров (для примера)
    author: { name: 'ФИО', slug: 'fio' },
    documents: [
      { title: 'Технический паспорт', url: '#', format: 'PDF' },
      { title: 'Инструкция по сборке', url: '#', format: 'PDF' },
    ],
    care: 'Текст по уходу: рекомендации по очистке и эксплуатации.',
    demo: true,
    status: 'approved',
    popularity: row.popularity,
    createdAt:
      row.num <= 28
        ? `2026-09-${nn}`
        : `2026-10-${String(row.num - 28).padStart(2, '0')}`,
  }
})
