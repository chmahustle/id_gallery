import type { MouseEvent } from 'react'
import type { BrandCatalog } from '../types'
import './ui/Button.css'
import './CatalogCover.css'

type Props = {
  item: BrandCatalog
  /** Имя фабрики над названием; на странице бренда скрыто */
  brandName?: string
}

/** Заглушка «#» не должна уводить со страницы */
const stay = (url: string) => (event: MouseEvent) => {
  if (url === '#') event.preventDefault()
}

/** Каталог фабрики: обложка, короткое имя, выпуск, «Открыть каталог». Один компонент на сайте. */
export function CatalogCover({ item, brandName }: Props) {
  const meta = [item.edition, item.format].filter(Boolean).join(' · ')
  return (
    <div className="catalog-cover">
      <div className="catalog-cover__media">
        <a
          className="catalog-cover__open"
          href={item.url}
          target="_blank"
          rel="noopener"
          aria-label={`Открыть каталог ${brandName ? `${brandName} ` : ''}${item.title}`}
          onClick={stay(item.url)}
        >
          {item.cover ? (
            <img src={item.cover} alt="" loading="lazy" />
          ) : (
            <span className="catalog-cover__tile">{item.title}</span>
          )}
        </a>
        <a
          className="ui-btn catalog-cover__action"
          href={item.url}
          target="_blank"
          rel="noopener"
          tabIndex={-1}
          onClick={stay(item.url)}
        >
          Открыть каталог
        </a>
      </div>
      {brandName ? <p className="catalog-cover__brand">{brandName}</p> : null}
      <p className="catalog-cover__title">{item.title}</p>
      {meta ? <p className="catalog-cover__meta">{meta}</p> : null}
    </div>
  )
}
