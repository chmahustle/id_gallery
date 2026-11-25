/* рамки фото для окна «Кадр»: в каких пропорциях фото стоит на сайте */

/** Готовые рамки: как фото стоит в разных местах сайта */
export type FrameAspect = { label: string; ratio: number }

export const FRAMES: Record<'hero' | 'card43' | 'card32' | 'portrait' | 'wide', FrameAspect[]> = {
  hero: [
    { label: 'Первый экран, компьютер', ratio: 16 / 9 },
    { label: 'Первый экран, телефон', ratio: 9 / 16 },
  ],
  card43: [{ label: 'Карточка в каталоге', ratio: 4 / 3 }],
  card32: [{ label: 'Карточка в списке', ratio: 3 / 2 }],
  portrait: [{ label: 'Вертикальное фото', ratio: 4 / 5 }],
  wide: [
    { label: 'Широкий блок', ratio: 16 / 9 },
    { label: 'На телефоне', ratio: 4 / 5 },
  ],
}

/** Как фото стоит на холсте сейчас (object-position из кода) — с этого кадр начинается */
export function measuredStart(fieldId: string) {
  const el = document.querySelector<HTMLElement>(`[data-idg-edit="${CSS.escape(fieldId)}"]`)
  if (!el) return null
  const match = /^([\d.]+)%\s+([\d.]+)%$/.exec(getComputedStyle(el).objectPosition || '')
  return match ? { x: Number(match[1]), y: Number(match[2]), zoom: 1 } : null
}

/**
 * Рамки фото в конструкторе: размер берётся с самой страницы на холсте
 * (холст — компьютер 1440px); для широких фото — ещё вид на телефоне.
 */
export function measuredFrames(fieldId: string): FrameAspect[] {
  const el = document.querySelector<HTMLElement>(`[data-idg-edit="${CSS.escape(fieldId)}"]`)
  const width = el?.offsetWidth || 0
  const height = el?.offsetHeight || 0
  if (!width || !height) return FRAMES.wide
  const list: FrameAspect[] = [{ label: 'Как на сайте, компьютер', ratio: width / height }]
  if (width >= 1200 && height >= 600) list.push({ label: 'Первый экран, телефон', ratio: 9 / 16 })
  else if (width >= 900) list.push({ label: 'На телефоне, примерно', ratio: 4 / 5 })
  return list
}
