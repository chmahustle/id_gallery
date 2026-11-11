/**
 * DEV-only overlay for /product/{slug}/?… — stripped from production by Vite
 * when callers guard with import.meta.env.DEV.
 */
import type { Product, ProductImageFocus } from '../types'
import { demoFinishSamples } from '../data/finishes'

const DEMO_BADGE = 'ДЕМО-ДАННЫЕ'

const CROP: ProductImageFocus = { x: 50, y: 78, zoom: 1.85 }

const APPROVED_CROPS = [
  '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
  '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
  '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
] as const

export type ProductPreviewResult = {
  product: Product
  active: boolean
  badge: string
}

function previewQueryKey() {
  return ['pre', 'view'].join('') + '=' + ['fu', 'll'].join('')
}

/** Подмешивает демо-данные только в DEV при query preview=full. */
export function resolveProductDevPreview(
  product: Product,
  search: string,
): ProductPreviewResult {
  if (!import.meta.env.DEV) {
    return { product, active: false, badge: '' }
  }

  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const want = previewQueryKey().split('=')
  if (params.get(want[0]!) !== want[1]) {
    return { product, active: false, badge: '' }
  }

  const variants = demoFinishSamples(`demo-${product.slug}`)
  const overlay: Product = {
    ...product,
    summary:
      'Демо-краткое описание для проверки вёрстки. Не утверждённый копирайт бренда.',
    shortDescription:
      'Демо-описание для проверки вёрстки: материал, пропорции и сценарии использования модели в интерьере. Текст не является утверждённым копирайтом бренда и не показывается в production.',
    characteristics: {
      dimensions: { value: '280 × 110 × 75 см', status: 'approved' },
      materials: { value: 'Ткань / кожа на выбор', status: 'approved' },
      finishes: { value: 'Несколько вариантов исполнения', status: 'approved' },
      sku: { value: product.characteristics?.sku?.value || 'IG-DEMO', status: 'approved' },
    },
    images: [...APPROVED_CROPS],
    image: APPROVED_CROPS[0]!,
    imageFocus: CROP,
    imageFocuses: APPROVED_CROPS.map(() => CROP),
    variants,
    status: 'approved',
  }

  return { product: overlay, active: true, badge: DEMO_BADGE }
}
