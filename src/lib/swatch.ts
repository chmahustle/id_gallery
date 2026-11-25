/** Фон образца: фото фактуры (адрес картинки) или цвет */
export function swatchBackground(item: { swatch?: string; hex?: string } | null | undefined) {
  const value = String(item?.swatch || item?.hex || '').trim()
  if (/^(\/|https?:\/\/)/.test(value)) return `center / cover no-repeat url("${value}")`
  return value || 'var(--color-swatch-fallback)'
}
