import { Link } from 'react-router-dom'
import { useContent } from '../content/ContentContext'
import AppLink from './AppLink'
import './Footer.css'

const YEAR = 2026

export default function Footer() {
  const { content } = useContent()
  const { site, contacts, header, mainNav, catalogCategories } = content

  const columns = [
    { title: 'Разделы', links: mainNav },
    {
      title: 'Каталог',
      links: catalogCategories.map(({ label, href }) => ({ label, href })),
    },
    {
      title: 'Сервис',
      links: [
        { label: 'Запись на экскурсию', href: '/contacts' },
        { label: 'Запросить КП', href: '/contacts' },
        { label: 'Каталоги брендов', href: '#sourcebooks' },
        { label: header.partners, href: '/partners' },
      ],
    },
    {
      title: 'Правовая информация',
      links: [{ label: 'Политика конфиденциальности', href: '/contacts' }],
    },
  ]

  return (
    <footer className="footer">
      <Link to="/" className="footer__brand" aria-label={`${site.name} — главная`}>
        <img
          className="footer__logo"
          src="/brand/logo-mark-light.webp"
          alt=""
          width={55}
          height={160}
          decoding="async"
        />
      </Link>

      <div className="footer__grid">
        {columns.map((col) => (
          <div key={col.title} className="footer__col">
            <h3>{col.title}</h3>
            <ul>
              {col.links.map((link, index) =>
                link.label?.trim() ? (
                  <li key={`${index}-${link.href}-${link.label}`}>
                    <AppLink to={link.href}>{link.label}</AppLink>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer__bottom">
        <p>
          © {YEAR} {site.name}
        </p>
        <address className="footer__contacts">
          {[
            contacts.phone?.trim() ? (
              <a key="phone" href={contacts.phoneHref}>
                {contacts.phone}
              </a>
            ) : null,
            contacts.email?.trim() ? (
              <a key="email" href={contacts.emailHref}>
                {contacts.email}
              </a>
            ) : null,
            contacts.hours?.trim() ? (
              <span key="hours">{contacts.hours}</span>
            ) : null,
          ]
            .filter(Boolean)
            .flatMap((node, index, arr) =>
              index < arr.length - 1
                ? [node, <span key={`sep-${index}`} aria-hidden="true">·</span>]
                : [node],
            )}
        </address>
        <p className="footer__locale">
          {site.locale}
          <span aria-hidden="true"> · </span>
          {contacts.address}
          <span aria-hidden="true"> · </span>
          <Link to="/admin">Админ</Link>
        </p>
      </div>
    </footer>
  )
}
