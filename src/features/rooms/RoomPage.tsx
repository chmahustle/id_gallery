import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Placeholder } from '../../components/Placeholder'
import { ProductCard } from '../../components/catalog/ProductCard'
import { Button, Reveal } from '../../components/ui'
import { interiorsCopy } from '../../data/interiors'
import type { Room } from '../../data/rooms'
import { getRoomInteriors, getRoomProducts } from '../../lib/rooms'
import { CropImage } from '../brands/CropImage'
import { InteriorRow } from '../interiors/InteriorRow'
import { useRevealOnce } from '../brands/useRevealOnce'
import '../interiors/InteriorsPage.css'
import './RoomsPage.css'

type RoomPageProps = {
  room: Room
}

/** /rooms/:slug — вступительное фото → товары всех брендов → интерьерные примеры */
export function RoomPage({ room }: RoomPageProps) {
  const all = useMemo(() => getRoomProducts(room.slug), [room.slug])
  const interiorsList = getRoomInteriors(room.slug)
  const cover = interiorsList[0]
  const [brand, setBrand] = useState('')
  const [type, setType] = useState('')
  const [heroReady, setHeroReady] = useState(false)
  const rowsReveal = useRevealOnce<HTMLElement>()

  useEffect(() => {
    setBrand('')
    setType('')
  }, [room.slug])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setHeroReady(true)
      return undefined
    }
    const id = window.requestAnimationFrame(() => setHeroReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [room.slug])

  const brands = [...new Set(all.map((item) => item.brand))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
  const types = [...new Set(all.map((item) => item.category))].sort((a, b) =>
    a.localeCompare(b, 'ru'),
  )
  const items = all.filter(
    (item) =>
      (!brand || item.brand === brand) && (!type || item.category === type),
  )

  return (
    <article className="interiors-page interiors-page--detail">
      <section
        className={[
          'interiors-page__hero interiors-page__hero--detail',
          heroReady ? 'is-ready' : '',
        ].join(' ')}
        aria-labelledby="room-title"
      >
        <div className="interiors-page__hero-media" data-reveal-media>
          {cover?.image ? (
            <CropImage
              src={cover.image}
              focus={cover.imageFocus}
              zoom={cover.imageFocus.zoom}
              height={900}
              alt=""
              className="interiors-page__hero-crop"
              priority
            />
          ) : (
            <Placeholder
              className="interiors-page__hero-ph"
              variant="default"
              label=""
            />
          )}
        </div>
        <div className="interiors-page__hero-scrim" aria-hidden="true" />
        <div className="interiors-page__hero-content">
          <h1 id="room-title" className="interiors-page__title">
            {room.label}
          </h1>
        </div>
      </section>

      <Reveal
        as="section"
        className="interiors-page__models"
        aria-labelledby="room-products-title"
      >
        <div className="interiors-page__models-head">
          <div className="interiors-page__models-intro">
            <h2
              id="room-products-title"
              className="interiors-page__models-title"
            >
              Товары
            </h2>
            <p className="interiors-page__models-lead">
              Модели всех брендов ID Gallery для этой комнаты.
            </p>
          </div>
          <div className="interiors-page__models-cta">
            <Button as={Link} variant="secondary" withArrow to="/rooms/">
              Все комнаты
            </Button>
          </div>
        </div>

        <div className="room-filters">
          <div className="room-filters__group" role="group" aria-label="Бренд">
            <span className="room-filters__label">Бренд</span>
            {['', ...brands].map((name) => (
              <button
                key={name || 'all'}
                type="button"
                className={`room-filters__chip ${brand === name ? 'is-active' : ''}`}
                aria-pressed={brand === name}
                onClick={() => setBrand(name)}
              >
                {name || 'Все'}
              </button>
            ))}
          </div>
          <div
            className="room-filters__group"
            role="group"
            aria-label="Тип предмета"
          >
            <span className="room-filters__label">Тип предмета</span>
            {['', ...types].map((name) => (
              <button
                key={name || 'all'}
                type="button"
                className={`room-filters__chip ${type === name ? 'is-active' : ''}`}
                aria-pressed={type === name}
                onClick={() => setType(name)}
              >
                {name || 'Все'}
              </button>
            ))}
          </div>
        </div>

        {items.length > 0 ? (
          <div className="interiors-page__models-grid">
            {items.map((item) => (
              <ProductCard
                key={item.slug}
                item={item}
                ctaLabel={interiorsCopy.detailProductCta}
              />
            ))}
          </div>
        ) : (
          <p className="room-page__empty" role="status">
            По выбранным условиям моделей нет.
          </p>
        )}

        <div className="room-page__actions">
          <Button as={Link} variant="secondary" to="/request/?type=offer">
            Обсудить подбор
          </Button>
        </div>
      </Reveal>

      {interiorsList.length > 0 ? (
        <section
          ref={rowsReveal.nodeRef}
          className={[
            'interiors-page__rows',
            rowsReveal.revealed ? 'is-in' : '',
          ].join(' ')}
          aria-label="Интерьерные примеры"
        >
          {interiorsList.map((item, index) => (
            <InteriorRow key={item.slug} item={item} mirrored={index % 2 === 1} />
          ))}
        </section>
      ) : null}

      <div className="interiors-page__footer-gap" aria-hidden="true" />
    </article>
  )
}
