import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Placeholder } from '../../components/Placeholder'
import { Button, Reveal } from '../../components/ui'
import { filterProducts } from '../../catalog/catalog'
import { homeSections } from '../../data/home'
import { products } from '../../data/products'
import { rooms } from '../../data/rooms'
import { resolveBrandName } from '../../lib/catalog'
import './home-sections.css'

const FEATURED_COUNT = 4

/** Каталог и модели: переключатели комнат + до четырёх моделей выбранной комнаты */
export function FeaturedSection() {
  const copy = homeSections.featured

  /* Только комнаты, в которых уже есть товары */
  const available = useMemo(
    () =>
      rooms
        .map((room) => ({
          room,
          items: filterProducts(products, { room: room.slug }),
        }))
        .filter((entry) => entry.items.length > 0),
    [],
  )

  const [activeSlug, setActiveSlug] = useState(available[0]?.room.slug ?? '')
  const active = available.find((entry) => entry.room.slug === activeSlug)
  const items = (active?.items ?? []).slice(0, FEATURED_COUNT)

  return (
    <Reveal
      as="section"
      className="home-section home-section--featured"
      id={copy.id}
      aria-labelledby="home-featured-title"
    >
      <div className="home-section__inner">
        <div className="home-featured__head">
          <div className="home-featured__intro">
            <h2 id="home-featured-title" className="home-section__title">
              {copy.title}
            </h2>
            <p className="home-section__desc">{copy.description}</p>
          </div>
          <div className="home-featured__actions">
            <Button as="link" to={copy.cta.href} variant="primary" withArrow>
              {copy.cta.label}
            </Button>
          </div>
        </div>

        {available.length > 0 ? (
          <div
            className="home-featured__rooms"
            role="tablist"
            aria-label="Комнаты"
          >
            {available.map(({ room }) => (
              <button
                key={room.slug}
                type="button"
                role="tab"
                aria-selected={room.slug === activeSlug}
                className={`home-featured__room ${
                  room.slug === activeSlug ? 'is-active' : ''
                }`}
                onClick={() => setActiveSlug(room.slug)}
              >
                {room.label}
              </button>
            ))}
            <Link className="home-featured__room home-featured__room--all" to="/rooms/">
              Все комнаты
              <span className="home-featured__room-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        ) : null}

        <ul className="home-featured__grid">
          {items.map((item, index) => {
            const approved = item.status === 'approved' && Boolean(item.image)
            const num = String(index + 1).padStart(2, '0')
            return (
              <li key={item.slug}>
                <Link className="home-featured__card" to={`/product/${item.slug}`}>
                  <span className="home-featured__media">
                    {approved ? (
                      <img
                        src={item.image}
                        alt=""
                        width={480}
                        height={600}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <Placeholder
                        variant="light"
                        showBadge
                        label={`${num} ${item.name}`}
                      />
                    )}
                  </span>
                  <span className="home-featured__meta">
                    <span className="home-featured__brand">
                      {resolveBrandName(item)}
                    </span>
                    <span className="home-featured__name">{item.name}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </Reveal>
  )
}
