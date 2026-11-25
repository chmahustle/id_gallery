import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  contactPageCopy,
  getContactInfoRows,
  groupContacts,
  isContactValueReady,
} from '../../data/contact-page'
import { showrooms } from '../../data/showrooms'
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
  /* шоурумы с подтверждённым адресом */
  const showroomRows = showrooms.filter((item) => item.status === 'approved' && item.address)

  if (!hasApproved && !showroomRows.length && !showPlaceholders) return null

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

      {!hasApproved && !showroomRows.length && showPlaceholders ? (
        <p className="contact-page__pending-note">
          {contactPageCopy.valuePending}
        </p>
      ) : null}

      {hasApproved || showroomRows.length ? (
        <dl className="contact-page__rows">
          {groupContacts(approved).map((group) => (
            <div key={group.label} className="contact-page__row">
              <dt className="contact-page__row-label">{group.label}</dt>
              {group.items.map((row) => (
                <dd key={row.value} className="contact-page__row-value">
                  {row.href ? (
                    <a
                      href={row.href}
                      {...(/^https?:/.test(row.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              ))}
            </div>
          ))}
          {/* адреса шоурумов — из вкладки «Контакты и шоурумы» */}
          {showroomRows.length ? (
            <div className="contact-page__row">
              <dt className="contact-page__row-label">Шоурумы</dt>
              {showroomRows.map((item) => (
                <dd key={item.slug} className="contact-page__row-value contact-page__showroom">
                  <Link to="/showrooms/">{`${item.name}${item.city ? ` · ${item.city}` : ''}`}</Link>
                  <span>{[item.address, item.hours].filter(Boolean).join(' · ')}</span>
                </dd>
              ))}
            </div>
          ) : null}
        </dl>
      ) : null}
    </section>
  )
}
