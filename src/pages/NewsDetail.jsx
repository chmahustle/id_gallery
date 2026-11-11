import { useEffect, useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { toIsoDate } from '../content'
import { useContent } from '../content/ContentContext'
import { useNews } from '../news/NewsContext'
import SiteShell from '../components/SiteShell'
import { Button } from '../components/ui'
import './News.css'

function normalizeGallery(item) {
  if (item.images?.length) {
    return item.images.map((photo) =>
      typeof photo === 'string'
        ? { src: photo, caption: '' }
        : { src: photo.src, caption: photo.caption || '' },
    )
  }
  if (item.image) return [{ src: item.image, caption: item.title }]
  return []
}

function CtaButton({ item }) {
  const label = `${item.ctaLabel || 'Записаться на встречу'} →`
  if (item.ctaHref && /^https?:\/\//i.test(item.ctaHref)) {
    return (
      <Button
        as="a"
        variant="primary"
        href={item.ctaHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </Button>
    )
  }
  return (
    <Button as="link" variant="primary" to={item.ctaHref || '/contacts'}>
      {label}
    </Button>
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

  const gallery = useMemo(
    () => (item ? normalizeGallery(item) : []),
    [item],
  )

  if (!ready) {
    return <div className="page" aria-busy="true" />
  }

  if (!item) {
    return <Navigate to="/news" replace />
  }

  const { prev, next } = getAdjacentNews(item.slug)
  const hero = gallery[0] || null
  const restPhotos = gallery.slice(1)
  const secondary =
    restPhotos.length >= 2 ? restPhotos[restPhotos.length - 1] : null
  const stripSource = secondary
    ? restPhotos.filter((photo) => photo.src !== secondary.src)
    : restPhotos
  const stripImages = [...stripSource]
  const fillers = [
    '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
    '/placeholders/product-02.jpg',
    '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
    '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
    '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
    '/images/hero.jpg',
  ]
  let fillIndex = 0
  while (stripImages.length < 4) {
    const src = fillers[fillIndex % fillers.length]
    fillIndex += 1
    if (
      src === hero?.src ||
      src === secondary?.src ||
      stripImages.some((photo) => photo.src === src)
    ) {
      if (fillIndex > fillers.length * 2) break
      continue
    }
    stripImages.push({ src, caption: '' })
  }

  const paragraphs = item.body || []
  const beforeStrip = paragraphs.slice(0, 2)
  const afterStrip = paragraphs.slice(2)

  return (
    <SiteShell variant="solid">
      <article className="news-detail">
        <div className="news-detail__intro">
          <nav className="news-crumbs" aria-label="Хлебные крошки">
            <Link to="/">Главная</Link>
            <span aria-hidden="true">-</span>
            <Link to="/news">События</Link>
            <span aria-hidden="true">-</span>
            <span>{item.title}</span>
          </nav>

          <header className="news-detail__head">
            <h1>{item.title}</h1>
            <p className="news-detail__meta">
              <time dateTime={toIsoDate(item.date)}>{item.date}</time>
              <span aria-hidden="true"> • </span>
              <span>{item.category}</span>
            </p>
          </header>
        </div>

        {hero ? (
          <figure className="news-detail__hero">
            <img src={hero.src} alt={hero.caption || item.title} />
          </figure>
        ) : null}

        <div className="news-detail__column">
          {beforeStrip.map((paragraph, index) => (
            <p key={`before-${index}`}>{paragraph}</p>
          ))}

          <div className="news-detail__actions">
            <CtaButton item={item} />
          </div>

          {stripImages.length ? (
            <ul className="news-detail__strip" aria-label="Галерея">
              {stripImages.slice(0, 4).map((photo, index) => (
                <li key={`${index}-${photo.src}`}>
                  <img
                    src={photo.src}
                    alt={photo.caption || ''}
                    loading="lazy"
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {afterStrip.map((paragraph, index) => (
            <p key={`after-${index}`}>{paragraph}</p>
          ))}

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

          {item.externalUrl ? (
            <p className="news-detail__external">
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Внешний материал →
              </a>
            </p>
          ) : null}
        </div>

        {secondary && secondary.src !== hero?.src ? (
          <figure className="news-detail__secondary">
            <img
              src={secondary.src}
              alt={secondary.caption || item.title}
              loading="lazy"
            />
          </figure>
        ) : null}

        <nav className="news-detail__nav" aria-label="Соседние новости">
          <div className="news-detail__nav-side">
            {prev ? (
              <>
                <p className="news-detail__nav-title">{prev.title}</p>
                <Link
                  to={newsPath(prev.slug)}
                  className="news-detail__nav-btn"
                >
                  ← К предыдущей
                </Link>
              </>
            ) : null}
          </div>
          <div className="news-detail__nav-side news-detail__nav-side--next">
            {next ? (
              <>
                <p className="news-detail__nav-title">{next.title}</p>
                <Link
                  to={newsPath(next.slug)}
                  className="news-detail__nav-btn"
                >
                  К следующей →
                </Link>
              </>
            ) : null}
          </div>
        </nav>
      </article>
    </SiteShell>
  )
}
