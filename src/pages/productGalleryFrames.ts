import type { ContentStatus, Product, ProductImageFocus } from '../types'

export type GalleryFrame = {
  src: string
  focus: ProductImageFocus
  /** approved — кадр из images[]; placeholder — доп. approved-источник для демо */
  status: ContentStatus
}

/** Нижняя зона — без читаемых надписей бренда сверху кадра */
const DEFAULT_FOCUS: ProductImageFocus = { x: 50, y: 78, zoom: 1.85 }

/**
 * Разные approved-файлы (не один диван) для добивки галереи до 3–4 кадров.
 * Пути совпадают с public/images/manifest.json approved:true.
 */
const APPROVED_POOL: Array<{ src: string; focus: ProductImageFocus }> = [
  {
    src: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
    focus: { x: 35, y: 80, zoom: 2.0 },
  },
  {
    src: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
    focus: { x: 50, y: 78, zoom: 1.85 },
  },
  {
    src: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
    focus: { x: 55, y: 76, zoom: 1.9 },
  },
  {
    src: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg',
    focus: { x: 65, y: 75, zoom: 1.9 },
  },
]

const MAX_FRAMES = 4

/**
 * Кадры галереи: разные approved-источники (3–4), кроп без бренда в кадре.
 * Меньше 5 — сетка всё равно 5 колонок, пустые ячейки не рендерятся.
 */
export function buildGalleryFrames(product: Product): GalleryFrame[] {
  const own = (product.images?.length ? product.images : [product.image])
    .map((src) => (src || '').trim())
    .filter(Boolean)

  const frames: GalleryFrame[] = []
  const seen = new Set<string>()

  for (let index = 0; index < own.length; index++) {
    const src = own[index]!
    if (seen.has(src)) continue
    seen.add(src)
    frames.push({
      src,
      focus:
        product.imageFocuses?.[index] ||
        product.imageFocus ||
        DEFAULT_FOCUS,
      status: 'approved',
    })
    if (frames.length >= MAX_FRAMES) return frames
  }

  for (const extra of APPROVED_POOL) {
    if (frames.length >= MAX_FRAMES) break
    if (seen.has(extra.src)) continue
    seen.add(extra.src)
    frames.push({
      src: extra.src,
      focus: extra.focus,
      status: 'placeholder',
    })
  }

  return frames
}
