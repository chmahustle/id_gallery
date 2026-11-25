/**
 * Кадр фото из админки: какая часть снимка видна на сайте.
 * Хранится в адресе фото после «#frame=x,y,zoom» — браузер грузит тот же
 * файл, а сайт по этой метке сдвигает и приближает снимок в рамке.
 * x, y — точка кадра в процентах (0–100), zoom — приближение (1–3).
 */
export type ImageFrame = { x: number; y: number; zoom: number }

export const FRAME_DEFAULT: ImageFrame = { x: 50, y: 50, zoom: 1 }
export const ZOOM_MIN = 1
export const ZOOM_MAX = 3

const FRAME_RE = /#frame=(-?[\d.]+),(-?[\d.]+),([\d.]+)$/

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function readFrame(src: string | null | undefined): ImageFrame | null {
  const match = FRAME_RE.exec(String(src || ''))
  if (!match) return null
  return {
    x: clamp(Number(match[1]), 0, 100),
    y: clamp(Number(match[2]), 0, 100),
    zoom: clamp(Number(match[3]), ZOOM_MIN, ZOOM_MAX),
  }
}

/** Адрес файла без метки кадра */
export function stripFrame(src: string | null | undefined): string {
  return String(src || '').replace(FRAME_RE, '')
}

const isDefault = (frame: ImageFrame) =>
  Math.abs(frame.x - 50) < 0.5 && Math.abs(frame.y - 50) < 0.5 && frame.zoom < 1.005

/** Адрес фото с кадром; кадр «по центру без приближения» не записывается */
export function withFrame(src: string, frame: ImageFrame | null): string {
  const base = stripFrame(src)
  if (!base || !frame || isDefault(frame)) return base
  const r = (n: number) => Math.round(n * 10) / 10
  return `${base}#frame=${r(frame.x)},${r(frame.y)},${Math.round(frame.zoom * 100) / 100}`
}

/**
 * Стили снимка в рамке (object-fit: cover). Приближение — свойством scale,
 * чтобы не ломать эффекты наведения на transform; clip-path обрезает
 * увеличенный снимок по рамке, даже если у родителя нет overflow: hidden.
 */
export function frameStyle(frame: ImageFrame): Record<string, string> {
  const fx = frame.x / 100
  const fy = frame.y / 100
  const cut = 1 - 1 / frame.zoom
  const pct = (n: number) => `${Math.round(n * 10000) / 100}%`
  return {
    objectFit: 'cover',
    objectPosition: `${frame.x}% ${frame.y}%`,
    transformOrigin: `${frame.x}% ${frame.y}%`,
    scale: String(frame.zoom),
    clipPath:
      frame.zoom > 1
        ? `inset(${pct(fy * cut)} ${pct((1 - fx) * cut)} ${pct((1 - fy) * cut)} ${pct(fx * cut)})`
        : '',
  }
}
