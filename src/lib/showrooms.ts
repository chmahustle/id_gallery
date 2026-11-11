import { featureFlags } from '../data/featureFlags'
import { showrooms } from '../data/showrooms'
import type { ShowroomEntry } from '../types'

/** Approved-записи для публичного списка. */
export function getApprovedShowrooms(): ShowroomEntry[] {
  return showrooms.filter((item) => item.status === 'approved')
}

/**
 * Что показывать в блоке «Наши шоурумы»:
 * - есть approved → только они;
 * - иначе при showShowroomPlaceholders → placeholder-ряды;
 * - иначе → пустой массив (блок скрыт).
 */
export function getVisibleShowrooms(): ShowroomEntry[] {
  const approved = getApprovedShowrooms()
  if (approved.length > 0) return approved
  if (featureFlags.showShowroomPlaceholders) {
    return showrooms.filter((item) => item.status === 'placeholder')
  }
  return []
}

export function formatShowroomHeading(item: ShowroomEntry): string {
  return `${item.name} · ${item.city}`
}

/** Текст раскрытого блока: реальные данные или заглушка из §12. */
export function getShowroomDetailsText(
  item: ShowroomEntry,
  placeholderLabel: string,
): string {
  if (item.status === 'approved') {
    const parts = [item.address, item.hours].filter(Boolean)
    return parts.join('\n')
  }
  return placeholderLabel
}
