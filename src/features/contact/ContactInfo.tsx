import { useSearchParams } from 'react-router-dom'
import {
  contactPageCopy,
  getContactInfoRows,
  isContactValueReady,
} from '../../data/contact-page'
import { featureFlags } from '../../data/featureFlags'

export function ContactInfo() {
  const [params] = useSearchParams()
  const rows = getContactInfoRows()
  /* DEV-only: ?placeholders=0|1 для скриншотов; production игнорирует */
  const phParam = import.meta.env.DEV ? params.get('placeholders') : null
  const showPlaceholders =
    phParam === '0'
      ? false
      : phParam === '1'
        ? true
        : featureFlags.showContactPlaceholders

  const approved = rows.filter((row) => isContactValueReady(row))
  const hasApproved = approved.length > 0

  if (!hasApproved && !showPlaceholders) return null

  return (
    <section
      className="contact-page__info"
      aria-labelledby="contact-info-title"
    >
      <div className="contact-page__label-wrap">
        <span className="contact-page__label-rule" aria-hidden="true" />
        <h2 id="contact-info-title" className="contact-page__label">
          {contactPageCopy.infoTitle}
        </h2>
      </div>

      {!hasApproved && showPlaceholders ? (
        <p className="contact-page__pending-note">
          {contactPageCopy.valuePending}
        </p>
      ) : null}

      {hasApproved ? (
        <dl className="contact-page__rows">
          {approved.map((row) => (
            <div key={row.label} className="contact-page__row">
              <dt className="contact-page__row-label">{row.label}</dt>
              <dd className="contact-page__row-value">
                {row.href ? <a href={row.href}>{row.value}</a> : row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  )
}
