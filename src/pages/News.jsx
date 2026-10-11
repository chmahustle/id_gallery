import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toIsoDate } from '../content'
import { useContent } from '../content/ContentContext'
import { useNews } from '../news/NewsContext'
import SiteShell from '../components/SiteShell'
import './News.css'

export default function News() {
  const { ready: contentReady } = useContent()
  const { items, ready: newsReady, categories, newsPath } = useNews()
  const [category, setCategory] = useState('Все')
  const ready = contentReady && newsReady

  const filtered = useMemo(() => {
    if (category === 'Все') return items
    return items.filter((item) => item.category === category)
  }, [category, items])

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Новости — ID Gallery'
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  if (!ready) {
    return <div className="page" aria-busy="true" />
  }

  return (
    <SiteShell variant="solid">
      <div className="news-page">
        <header className="news-page__head">
          <h1>Новости и события</h1>
          <p>
            Обновления шоурумов, закрытые показы, эксклюзивы и материалы для
            партнёров.
          </p>
        </header>

        <div className="news-filters" role="group" aria-label="Категории новостей">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              className={category === name ? 'is-active' : undefined}
              aria-pressed={category === name}
              onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="news-empty" role="status">
            В этой категории пока нет новостей.
          </p>
        ) : (
          <div className="news-grid">
            {filtered.map((item) => (
              <article key={item.slug} className="news-card">
                <Link to={newsPath(item.slug)} className="news-card__media">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                  />
                </Link>
                <div className="news-card__body">
                  <div className="news-card__meta">
                    <time dateTime={toIsoDate(item.date)}>{item.date}</time>
                    <span>{item.category}</span>
                  </div>
                  <h2>
                    <Link to={newsPath(item.slug)}>{item.title}</Link>
                  </h2>
                  <p>{item.excerpt}</p>
                  <Link to={newsPath(item.slug)} className="news-card__more">
                    Читать
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  )
}
