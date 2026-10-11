import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  partnersPage,
  partnerTypes,
  toIsoDate,
} from '../content'
import { useBrands } from '../brands/BrandsContext'
import { useContent } from '../content/ContentContext'
import { useNews } from '../news/NewsContext'
import SiteShell from '../components/SiteShell'
import './Partners.css'

export default function Partners() {
  const { ready: contentReady } = useContent()
  const { items: brandLogos, ready: brandsReady } = useBrands()
  const { items: news, newsPath, ready: newsReady } = useNews()
  const page = partnersPage
  const ready = contentReady && newsReady && brandsReady

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Партнёрам — ID Gallery'
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  if (!ready) {
    return <div className="page" aria-busy="true" />
  }

  return (
    <SiteShell variant="solid">
      <div className="partners-page">
        <header className="partners-hero">
          <h1>{page.title}</h1>
          <p>{page.lead}</p>
          <Link to="/contacts" className="partners-btn partners-btn--solid">
            {page.ctaButton}
          </Link>
        </header>

        <section className="partners-types" aria-labelledby="partners-types-title">
          <h2 id="partners-types-title">{page.typesTitle}</h2>
          <div className="partners-types__grid">
            {partnerTypes.map((item) => (
              <article key={item.title} className="partners-card">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ul>
                  {item.perks.map((perk) => (
                    <li key={perk}>{perk}</li>
                  ))}
                </ul>
                <Link to="/contacts" className="partners-btn">
                  {item.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="partners-advantages" aria-labelledby="partners-adv-title">
          <div className="partners-advantages__media">
            <img
              src={page.image}
              alt="Партнёрство с ID Gallery — шоурум и проектная работа"
              loading="lazy"
            />
          </div>
          <div className="partners-advantages__copy">
            <h2 id="partners-adv-title">{page.advantagesTitle}</h2>
            <ul>
              {page.advantages.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <Link to="/contacts" className="partners-btn partners-btn--solid">
              {page.advantagesCta}
            </Link>
          </div>
        </section>

        <section className="partners-brands" aria-labelledby="partners-brands-title">
          <div className="partners-section-head">
            <h2 id="partners-brands-title">{page.brandsTitle}</h2>
            <p>{page.brandsLead}</p>
          </div>
          <ul className="partners-brands__grid">
            {brandLogos
              .filter((item) => item.logo)
              .map((item) => {
                const href =
                  item.website ||
                  `/catalog?brand=${encodeURIComponent(item.filter || item.name)}`
                const external = Boolean(item.website)
                return (
                  <li key={item.id || item.name}>
                    <a
                      href={href}
                      target={external ? '_blank' : undefined}
                      rel={external ? 'noopener noreferrer' : undefined}
                      aria-label={
                        external
                          ? `Официальный сайт ${item.name}`
                          : `Смотреть товары ${item.name}`
                      }
                    >
                      <img src={item.logo} alt={item.name} loading="lazy" />
                    </a>
                  </li>
                )
              })}
          </ul>
          <p className="partners-more">
            <Link to="/brands">Все бренды</Link>
          </p>
        </section>

        <section className="partners-news" aria-labelledby="partners-news-title">
          <div className="partners-section-head">
            <h2 id="partners-news-title">{page.newsTitle}</h2>
            <p>{page.newsLead}</p>
          </div>
          <div className="partners-news__grid">
            {news.slice(0, 3).map((item) => (
              <article key={item.slug}>
                <time dateTime={toIsoDate(item.date)}>{item.date}</time>
                <h3>
                  <Link to={newsPath(item.slug)}>{item.title}</Link>
                </h3>
                <p>{item.excerpt}</p>
              </article>
            ))}
          </div>
          <p className="partners-more">
            <Link to="/news">Все новости</Link>
          </p>
        </section>

        <section className="partners-cta" aria-label={page.ctaTitle}>
          <h2>{page.ctaTitle}</h2>
          <p>{page.ctaText}</p>
          <Link to="/contacts" className="partners-btn partners-btn--solid">
            {page.ctaButton}
          </Link>
        </section>
      </div>
    </SiteShell>
  )
}
