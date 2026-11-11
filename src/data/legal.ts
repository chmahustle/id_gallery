import type { ContentStatus } from '../types'
import { site } from './site'

export type LegalLink = {
  label: string
  href: string
  status: ContentStatus
}

/**
 * Юридические ссылки футера.
 * Рендерить только при status: 'approved'.
 */
export const legalLinks: LegalLink[] = [
  {
    label: site.legal.privacyLabel,
    href: site.legal.privacyHref,
    status: site.legal.hidden ? 'placeholder' : 'approved',
  },
  ...(site.legal.termsLabel && site.legal.termsHref
    ? [
        {
          label: site.legal.termsLabel,
          href: site.legal.termsHref,
          status: (site.legal.hidden ? 'placeholder' : 'approved') as ContentStatus,
        },
      ]
    : []),
]

export function getApprovedLegalLinks(): LegalLink[] {
  return legalLinks.filter((item) => item.status === 'approved')
}
