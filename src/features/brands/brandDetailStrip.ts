import type { Brand, BrandDetailFocus } from '../../types'

/** Approved paths from public/images/manifest.json (brand-related). */
const APPROVED_IMAGE_PATHS = new Set([
  '/images/brand-visionnaire.jpg',
  '/images/brand-molteni.jpg',
  '/images/brand-baxter.jpg',
  '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
  '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg',
  '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
  '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
])

const STRIP_HEIGHTS = [520, 360, 440] as const

export type DetailStripFrame = {
  src: string
  focus: BrandDetailFocus
  height: number
  index: number
}

/**
 * Кадры фото-полосы из brand.detailFocus (src + focus).
 * Без дублей; максимум 3; пусто → полосу не рендерить.
 */
export function getDetailStripFrames(brand: Brand): DetailStripFrame[] {
  const focuses = brand.detailFocus ?? []
  const frames: DetailStripFrame[] = []
  const seen = new Set<string>()

  for (const focus of focuses) {
    if (!focus.src || !APPROVED_IMAGE_PATHS.has(focus.src)) continue
    const key = `${focus.src}|${Math.round(focus.x)}|${Math.round(focus.y)}|${focus.zoom.toFixed(2)}`
    if (seen.has(key)) continue
    seen.add(key)
    frames.push({
      src: focus.src,
      focus,
      height: STRIP_HEIGHTS[frames.length] ?? 440,
      index: frames.length,
    })
    if (frames.length >= 3) break
  }

  return frames
}
