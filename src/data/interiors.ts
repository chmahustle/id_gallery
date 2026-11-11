import type { InteriorSelection, ProductImageFocus } from '../types'

/**
 * Интерьеры — docs/content-brief.md §11.
 * Изображения — только approved из public/images/manifest.json.
 * Hero страницы списка не повторяется в подборках.
 */

/** Кроп нижней зоны — без читаемых надписей бренда */
const CROP_BOTTOM: ProductImageFocus = { x: 50, y: 78, zoom: 1.85 }
const CROP_BOTTOM_LEFT: ProductImageFocus = { x: 35, y: 80, zoom: 2.0 }
const CROP_BOTTOM_RIGHT: ProductImageFocus = { x: 65, y: 75, zoom: 1.9 }

export type { InteriorSelection }

/** Копирайт страниц — только §11 */
export const interiorsCopy = {
  listHeroTitle: 'Интерьеры',
  listHeroLead:
    'Подборки мебели, материалов и освещения для разных пространств.',
  introLabel: 'Интерьерные подборки',
  introText:
    'Сочетания предметов помогают оценить масштаб, форму и взаимодействие материалов в интерьере.',
  rowCta: 'Смотреть подборку',
  detailModelsTitle: 'Предметы в этом интерьере',
  detailModelsLead: 'Модели, которые использованы в интерьере на фото.',
  similarTitle: 'Подойдут к этому интерьеру',
  similarLead: 'Подборка по комнате. Этих моделей на фото нет.',
  detailProductCta: 'Смотреть модель',
  backToList: 'Все подборки',
} as const

/**
 * Hero списка — не использовать в rows.
 * Файл ≥2400px по ширине (hero.jpg = 640px → пикселизация на 1920).
 */
export const interiorsListHero = {
  image: '/images/Gemini_Generated_Image_sq76gsq76gsq76gs.jpg',
  imageFocus: { x: 50, y: 55, zoom: 1 } satisfies ProductImageFocus,
} as const

const baseInteriors: InteriorSelection[] = [
  {
    slug: 'gostinaya',
    title: 'Гостиная',
    caption: 'Мягкая зона и освещение для гостиной.',
    image: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
    imageFocus: CROP_BOTTOM_LEFT,
    productIds: ['model-01-sofa', 'model-02-sofa', 'model-03-armchair', 'model-11-armchair'],
    room: 'gostinaya',
    status: 'placeholder',
  },
  {
    slug: 'stolovaya',
    title: 'Столовая',
    caption: 'Стол, стулья и свет для столовой зоны.',
    image: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
    imageFocus: CROP_BOTTOM,
    productIds: ['model-04-chair', 'model-12-chair', 'model-13-table'],
    room: 'stolovaya',
    status: 'placeholder',
  },
  {
    slug: 'gostinaya-svetlaya',
    title: 'Гостиная в тёплой палитре',
    caption: 'Тёплые тона для гостиной зоны.',
    image: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
    imageFocus: CROP_BOTTOM_RIGHT,
    productIds: ['model-01-sofa', 'model-06-sofa', 'model-07-armchair'],
    room: 'gostinaya',
    status: 'placeholder',
  },
]

const demoEnabled = ['true', '1'].includes(
  String(import.meta.env?.VITE_DEMO_DATA ?? ''),
)

/* demoInteriors.ts опционален (VITE_DEMO_DATA); в Node-скриптах без Vite — пусто */
let demoModules: Record<
  string,
  {
    demoInteriors: InteriorSelection[]
    demoInteriorBrands: Record<string, string[]>
  }
> = {}
try {
  demoModules = import.meta.glob('./demoInteriors.ts', { eager: true })
} catch {
  demoModules = {}
}
const demo = demoEnabled ? Object.values(demoModules)[0] : undefined

export const interiors: InteriorSelection[] = demo
  ? [
      ...baseInteriors.map((item) => ({
        ...item,
        brands: item.brands ?? demo.demoInteriorBrands[item.slug],
      })),
      ...demo.demoInteriors,
    ]
  : baseInteriors
