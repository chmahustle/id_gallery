import { useEffect } from 'react'
import { buildWhatsAppLeadUrl } from '../catalog/catalog'
import { contactsPage } from '../content'
import { useContent } from '../content/ContentContext'
import ContactLeadForm from '../components/ContactLeadForm'
import SiteShell from '../components/SiteShell'
import './Contacts.css'

export default function Contacts() {
  const { content, ready } = useContent()
  const page = contactsPage
  const { contacts } = content

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Контакты — ID Gallery'
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  if (!ready) {
    return <div className="page" aria-busy="true" />
  }

  const whatsappHref = buildWhatsAppLeadUrl(
    contacts.whatsapp,
    'Здравствуйте! Пишу из раздела «Контакты» на сайте ID Gallery.',
  )
  const cities = page.showrooms.map((item) => item.city)

  return (
    <SiteShell variant="solid">
      <div className="contacts-page">
        <header className="contacts-hero">
          <h1>{page.title}</h1>
          <p>{page.lead}</p>
        </header>

        <section className="contacts-info" aria-label="Контактные данные">
          <address className="contacts-card">
            <p className="contacts-card__label">Горячая линия</p>
            <p>
              <a href={contacts.phoneHref}>{contacts.phone}</a>
            </p>
            <p className="contacts-card__label">WhatsApp</p>
            <p>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                {contacts.whatsapp}
              </a>
            </p>
            <p className="contacts-card__label">E-mail</p>
            <p>
              <a href={contacts.emailHref}>{contacts.email}</a>
            </p>
            <p className="contacts-card__label">Часы работы</p>
            <p>{contacts.hours}</p>
            <p className="contacts-card__note">{contacts.addressDetail}</p>
          </address>

          <div className="contacts-depts">
            <h2>Почты отделов</h2>
            <ul>
              {page.departments.map((item) => (
                <li key={item.email}>
                  <span>{item.label}</span>
                  <a href={`mailto:${item.email}`}>{item.email}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="contacts-showrooms" aria-labelledby="showrooms-title">
          <h2 id="showrooms-title">Флагманские салоны</h2>
          <div className="contacts-showrooms__grid">
            {page.showrooms.map((salon) => (
              <article key={salon.city} className="contacts-salon">
                <h3>{salon.city}</h3>
                <p>{salon.address}</p>
                <div className="contacts-salon__map">
                  <iframe
                    title={salon.mapLabel}
                    src={salon.mapSrc}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
                <p className="contacts-salon__map-text">
                  <span className="sr-only">Адрес на карте: </span>
                  {salon.address}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="contacts-forms" aria-label="Заявки">
          <ContactLeadForm type="tour" cities={cities} />
          <ContactLeadForm type="quote" />
        </section>

        <section className="contacts-cta" aria-label={page.ctaTitle}>
          <h2>{page.ctaTitle}</h2>
          <p>{page.ctaText}</p>
          <a
            className="contacts-cta__btn"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            {page.ctaButton}
          </a>
        </section>
      </div>
    </SiteShell>
  )
}
