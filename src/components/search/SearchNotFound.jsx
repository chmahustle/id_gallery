import { Link } from 'react-router-dom'
import { buildWhatsAppLeadUrl } from '../../catalog/catalog'
import { useContent } from '../../content/ContentContext'
import './SearchNotFound.css'

/** Пустой результат поиска: в панели и в каталоге */
export default function SearchNotFound({ query, onNavigate }) {
  const { content } = useContent()
  const href = buildWhatsAppLeadUrl(
    content.contacts.whatsapp,
    `Здравствуйте! Ищу: «${query}».`,
  )
  const hasWhatsApp = href && href !== '#'

  return (
    <div className="search-empty" role="status">
      <p className="search-empty__text">{`Ничего не найдено по запросу «${query}».`}</p>
      <div className="search-empty__links">
        <Link className="search-empty__link" to="/catalog" onClick={onNavigate}>
          Все товары
        </Link>
        {hasWhatsApp ? (
          <a
            className="search-empty__link"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            Написать в WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  )
}
