import { featureFlags } from '../data/featureFlags'
import type { CharacteristicField, ProductVariant } from '../types'

/** Значение подтверждено и годится для сравнения */
export function confirmedValue(field?: CharacteristicField): string {
  return field?.status === 'approved' && field.value.trim() ? field.value : ''
}

/** У выбранного исполнения есть подтверждённые размеры и материалы */
export function isComparable(variant: ProductVariant | null | undefined): boolean {
  return Boolean(
    variant && confirmedValue(variant.dimensions) && confirmedValue(variant.materials),
  )
}

/**
 * Кнопка «Сравнить»: только при сопоставимых данных исполнения.
 * Флаг showCompare (демо/разработка) показывает её заранее — для показа заказчику.
 */
export function canCompare(variant: ProductVariant | null | undefined): boolean {
  return featureFlags.showCompare || isComparable(variant)
}
