import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Placeholder } from '../../components/Placeholder'
import { ProductCard } from '../../components/catalog/ProductCard'
import { Button, Reveal } from '../../components/ui'
import { interiorsCopy } from '../../data/interiors'
import type { InteriorSelection } from '../../types'
import { getInteriorProducts } from '../../lib/interiors'
import { getRoomBySlug, getRoomProducts } from '../../lib/rooms'
import { CropImage } from '../brands/CropImage'
import './InteriorsPage.css'

type InteriorDetailPageProps = {
  selection: InteriorSelection
}

export function InteriorDetailPage({ selection }: InteriorDetailPageProps) {
  const products = getInteriorProducts(selection)
  const showModels = products.length > 0
  const room = selection.room ? getRoomBySlug(selection.room) : null
  /* «Подойдут к этому интерьеру»: товары комнаты, которых нет на фото */
  const similar = room
    ? getRoomProducts(room.slug)
        .filter((item) => !selection.productIds.includes(item.slug))
        .slice(0, 4)
    : []
  const [heroReady, setHeroReady] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setHeroReady(true)
      return undefined
    }
    const id = window.requestAnimationFrame(() => setHeroReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [selection.slug])

  return (
    <article className="interiors-page interiors-page--detail">
      <section
        className={[
          'interiors-page__hero interiors-page__hero--detail',
          heroReady ? 'is-ready' : '',
        ].join(' ')}
        aria-labelledby="interior-detail-title"
      >
        <div className="interiors-page__hero-media" data-reveal-media>
          {selection.image ? (
            <CropImage
              src={selection.image}
              focus={selection.imageFocus}
              zoom={selection.imageFocus.zoom}
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
          <h1 id="interior-detail-title" className="interiors-page__title">
            {selection.title}
          </h1>
        </div>
      </section>

      {showModels ? (
        <Reveal
          as="section"
          className="interiors-page__models"
          aria-labelledby="interior-models-title"
        >
          <div className="interiors-page__models-head">
            <div className="interiors-page__models-intro">
              <h2
                id="interior-models-title"
                className="interiors-page__models-title"
              >
                {interiorsCopy.detailModelsTitle}
              </h2>
              <p className="interiors-page__models-lead">
                {interiorsCopy.detailModelsLead}
              </p>
            </div>
            <div className="interiors-page__models-cta">
              {room ? (
                <Button
                  as={Link}
                  variant="secondary"
                  withArrow
                  to={`/rooms/${room.slug}`}
                >
                  {`Все товары для ${room.genitive}`}
                </Button>
              ) : null}
              <Button
                as={Link}
                variant="secondary"
                withArrow
                to="/interiors/"
              >
                {interiorsCopy.backToList}
              </Button>
            </div>
          </div>
          <div className="interiors-page__models-grid">
            {products.map((item) => (
              <ProductCard
                key={item.slug}
                item={item}
                ctaLabel={interiorsCopy.detailProductCta}
              />
            ))}
          </div>
        </Reveal>
      ) : null}

      {similar.length > 0 ? (
        <Reveal
          as="section"
          className="interiors-page__models"
          aria-labelledby="interior-similar-title"
        >
          <div className="interiors-page__models-head">
            <div className="interiors-page__models-intro">
              <h2
                id="interior-similar-title"
                className="interiors-page__models-title"
              >
                {interiorsCopy.similarTitle}
              </h2>
              <p className="interiors-page__models-lead">
                {interiorsCopy.similarLead}
              </p>
            </div>
          </div>
          <div className="interiors-page__models-grid">
            {similar.map((item) => (
              <ProductCard
                key={item.slug}
                item={item}
                ctaLabel={interiorsCopy.detailProductCta}
              />
            ))}
          </div>
        </Reveal>
      ) : null}

      {!showModels ? (
        <div className="interiors-page__back">
          <Button as={Link} variant="secondary" withArrow to="/interiors/">
            {interiorsCopy.backToList}
          </Button>
 
        </div>
      ) : null}

      <div className="interiors-page__footer-gap" aria-hidden="true" />
    </article>
  )
}
