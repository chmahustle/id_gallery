import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { toIsoDate } from '../content'
import { useContent } from '../content/ContentContext'
import { useNews } from '../news/NewsContext'
import SiteShell from '../components/SiteShell'
import './News.css'

function NewsGallery({ images, title }) {
  const [activeImage, setActiveImage] = useState(0)
  const current = images[activeImage] || images[0]
  if (!current) return null

  return (
    <>
      <figure className="news-detail__hero">
        <img src={current.src} alt={current.caption || title} />
        {current.caption ? <figcaption>{current.caption}</figcaption> : null}
      </figure>
      {images.length > 1 ? (
        <ul className="news-detail__thumbs">
          {images.map((photo, index) => (
            <li key={`${index}-${photo.src}`}>
              <button
                type="button"
                className={index === activeImage ? 'is-active' : undefined}
                onClick={() => setActiveImage(index)}
                aria-label={photo.caption || `Фото ${index + 1}`}
              >
                <img src={photo.src} alt="" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

export default function NewsDetail() {
  const { newsSlug } = useParams()
  const { ready: contentReady } = useContent()
  const {
    ready: newsReady,
    getNewsBySlug,
    getAdjacentNews,
    newsPath,
  } = useNews()
  const ready = contentReady && newsReady
  const item = getNewsBySlug(newsSlug)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [newsSlug])

  useEffect(() => {
    if (!item) return undefined
    document.title = `${item.title} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [item])

  if (!ready) {
    return <div className="page" aria-busy="true" />
  }

  if (!item) {
    return <Navigate to="/news" replace />
  }

  const { prev, next } = getAdjacentNews(item.slug)
  const gallery = item.images?.length
    ? item.images
    : item.image
      ? [{ src: item.image, caption: item.title }]
      : []

  return (
    <SiteShell variant="solid">
      <article className="news-detail">
        <nav className="news-detail__crumbs" aria-label="Хлебные крошки">
          <Link to="/news">Новости</Link>
          <span>/</span>
          <span>{item.category}</span>
        </nav>

        <header className="news-detail__head">
          <div className="news-detail__meta">
            <time dateTime={toIsoDate(item.date)}>{item.date}</time>
            <span>{item.category}</span>
          </div>
          <h1>{item.title}</h1>
          <p className="news-detail__excerpt">{item.excerpt}</p>
        </header>

        <NewsGallery key={item.slug} images={gallery} title={item.title} />

        <div className="news-detail__body">
          {item.body?.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
          ))}
        </div>

        {item.videoUrl ? (
          <div className="news-detail__video">
            <iframe
              src={item.videoUrl}
              title={`Видео: ${item.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : null}

        <div className="news-detail__actions">
          {item.ctaHref ? (
            /^https?:\/\//i.test(item.ctaHref) ? (
              <a
                href={item.ctaHref}
                className="news-btn news-btn--solid"
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.ctaLabel || 'Оставить заявку'}
              </a>
            ) : (
              <Link to={item.ctaHref} className="news-btn news-btn--solid">
                {item.ctaLabel || 'Оставить заявку'}
              </Link>
            )
          ) : null}
          {item.externalUrl ? (
            <a
              className="news-btn"
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Внешний материал
            </a>
          ) : null}
        </div>

        <nav className="news-detail__nav" aria-label="Соседние новости">
          {prev ? (
            <Link to={newsPath(prev.slug)} className="news-detail__nav-link">
              <span>Предыдущая</span>
              <strong>{prev.title}</strong>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={newsPath(next.slug)}
              className="news-detail__nav-link news-detail__nav-link--next"
            >
              <span>Следующая</span>
              <strong>{next.title}</strong>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </SiteShell>
  )
}
