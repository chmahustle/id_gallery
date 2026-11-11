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
    document.title = 'События — ID Gallery'
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
        <nav className="news-crumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span aria-hidden="true">-</span>
          <span>События</span>
        </nav>

        <header className="news-page__head">
          <h1>События</h1>
        </header>

        <div className="news-filters" role="tablist" aria-label="Категории новостей">
          {categories.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              className={category === name ? 'is-active' : undefined}
              aria-selected={category === name}
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
                  <img src={item.image} alt="" loading="lazy" />
                </Link>
                <div className="news-card__body">
                  <time
                    className="news-card__date"
                    dateTime={toIsoDate(item.date)}
                  >
                    {item.date}
                  </time>
                  <h2>
                    <Link to={newsPath(item.slug)}>{item.title}</Link>
                  </h2>
                  <p>{item.excerpt}</p>
                  <Link to={newsPath(item.slug)} className="news-card__more">
                    Читать →
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
