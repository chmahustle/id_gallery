/**
 * Панель «Варианты исполнения» — только цвета модели из данных товара.
 * Общие библиотеки тканей / сроки поставки удалены (этап 10).
 */
import type { ContentStatus, ProductVariant } from '../types'

export type FinishColor = {
  id: string
  name: string
  swatch: string
  image?: string
  status: ContentStatus
}

export type FinishGroup = {
  id: string
  title: string
  subtitle: string | null
  materials: { name: string; colors: FinishColor[] }[]
}

/** Только группа «Цвета модели»; без «В наличии» / «Под заказ». */
export function getProductFinishGroups(
  productColors: (ProductVariant & { hex?: string })[] = [],
): FinishGroup[] {
  const productList = Array.isArray(productColors) ? productColors : []
  if (!productList.length) return []

  return [
    {
      id: 'model',
      title: 'Цвета модели',
      subtitle: null,
      materials: [
        {
          name: 'Цвета модели',
          colors: productList.map((c) => ({
            id: c.id,
            name: c.name,
            swatch: c.swatch || c.hex || 'var(--color-swatch-fallback)',
            image: c.image,
            status: c.status || 'placeholder',
          })),
        },
      ],
    },
  ]
}
