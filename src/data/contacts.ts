import type { ContentStatus, SiteContact } from '../types'
import { site } from './site'

/**
 * Контакты футера / страницы контактов.
 * Показывать только status: 'approved' — без скобочных заглушек.
 */
export const contacts: SiteContact[] = site.contacts

export function getApprovedContacts(): SiteContact[] {
  return contacts.filter(
    (item) =>
      item.status === 'approved' &&
      Boolean(item.value?.trim()) &&
      !/^\[[^\]]+\]$/.test(item.value.trim()),
  )
}

export type { ContentStatus }
