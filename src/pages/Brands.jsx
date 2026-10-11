import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { catalogPath } from '../catalog/catalog'
import { brandsPage } from '../content'
import { useBrands } from '../brands/BrandsContext'
import { useContent } from '../content/ContentContext'
import SiteShell from '../components/SiteShell'
import './Brands.css'

export default function Brands() {
  const { ready: contentReady } = useContent()
  const { items: brandLogos, ready: brandsReady } = useBrands()
  const page = brandsPage
  const ready = contentReady && brandsReady

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Бренды — ID Gallery'
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  if (!ready) {
    return <div className="page" aria-busy="true" />
  }

  return (
    <SiteShell variant="solid">
      <div className="brands-page">
        <section className="brands-hero" aria-labelledby="brands-hero-title">
          <p className="brands-hero__eyebrow">{page.eyebrow}</p>
          <h1 id="brands-hero-title">{page.title}</h1>
          <p className="brands-hero__lead">{page.lead}</p>
        </section>

        <section className="brands-perks" aria-label="Преимущества">
          <ul>
            {page.perks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="brands-showcase" aria-labelledby="brands-list-title">
          <p className="brands-showcase__intro" id="brands-list-title">
            {page.brandsIntro}
          </p>
          <ul className="brands-logo-grid">
            {brandLogos.map((item) => (
              <li key={item.id || item.name}>
                <a
                  className="brands-logo-grid__logo"
                  href={item.website || catalogPath(null, { brand: item.filter })}
                  target={item.website ? '_blank' : undefined}
                  rel={item.website ? 'noopener noreferrer' : undefined}
                  aria-label={`Официальный сайт ${item.name}`}
                >
                  {item.logo ? (
                    <img
                      src={item.logo}
                      alt={item.name}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="brands-logo-grid__text">{item.name}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="brands-official">
            <h2>{page.officialSitesTitle}</h2>
            <ul>
              {brandLogos.map((item) =>
                item.website ? (
                  <li key={`site-${item.id || item.name}`}>
                    <span>{item.name}</span>
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </section>

        <section className="brands-limited" aria-labelledby="brands-limited-title">
          <div className="brands-limited__media">
            <img
              src={page.image}
              alt="Интерьер с дизайнерской мебелью ID Gallery"
              loading="lazy"
            />
          </div>
          <div className="brands-limited__copy">
            <p className="brands-limited__eyebrow">{page.limitedEyebrow}</p>
            <h2 id="brands-limited-title">{page.limitedTitle}</h2>
            <p>{page.limitedText}</p>
            <div className="brands-limited__actions">
              <Link to="/catalog" className="brands-btn brands-btn--solid">
                {page.ctaCatalog}
              </Link>
              <Link to="/contacts" className="brands-btn">
                {page.ctaTour}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  )
}
