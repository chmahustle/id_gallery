import { useEffect, useState } from 'react'
import { Placeholder } from '../../components/Placeholder'
import {
  showroomsCopy,
  showroomsListHero,
  showroomsVisitBanner,
} from '../../data/showrooms'
import { getVisibleShowrooms } from '../../lib/showrooms'
import { FullBleedBanner } from '../home/FullBleedBanner'
import { useRevealOnce } from '../brands/useRevealOnce'
import { ShowroomRow } from './ShowroomRow'
import './ShowroomsPage.css'

function heroSrcSet(src: string) {
  return `${src} 1280w, ${src} 1920w, ${src} 2560w`
}

export function ShowroomsPage() {
  const list = getVisibleShowrooms()
  const showList = list.length > 0
  const [heroReady, setHeroReady] = useState(false)
  const listReveal = useRevealOnce<HTMLElement>()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setHeroReady(true)
      return undefined
    }
    const id = window.requestAnimationFrame(() => setHeroReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  return (
    <article className="showrooms-page">
      <section
        className={['showrooms-page__hero', heroReady ? 'is-ready' : ''].join(
          ' ',
        )}
        aria-labelledby="showrooms-hero-title"
      >
        <div className="showrooms-page__hero-media" data-reveal-media>
          {showroomsListHero.image ? (
            <img
              className="showrooms-page__hero-img"
              src={showroomsListHero.image}
              srcSet={heroSrcSet(showroomsListHero.image)}
              sizes="100vw"
              alt=""
              width={2752}
              height={1536}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{ objectPosition: showroomsListHero.objectPosition }}
            />
          ) : (
            <Placeholder
              className="showrooms-page__hero-ph"
              variant="default"
              label=""
            />
          )}
        </div>
        <div className="showrooms-page__hero-scrim" aria-hidden="true" />
        <div className="showrooms-page__hero-content">
          <h1 id="showrooms-hero-title" className="showrooms-page__title">
            {showroomsCopy.heroTitle}
          </h1>
          <p className="showrooms-page__lead">{showroomsCopy.heroLead}</p>
        </div>
      </section>

      {showList ? (
        <section
          ref={listReveal.nodeRef}
          className={[
            'showrooms-page__list',
            listReveal.revealed ? 'is-in' : '',
          ].join(' ')}
          aria-labelledby="showrooms-list-label"
        >
          <div className="showrooms-page__band showrooms-page__list-head">
            <div className="showrooms-page__left showrooms-page__label-wrap">
              <span className="showrooms-page__label-rule" aria-hidden="true" />
              <h2
                id="showrooms-list-label"
                className="showrooms-page__label"
              >
                {showroomsCopy.listLabel}
              </h2>
            </div>
          </div>

          <div className="showrooms-page__rows">
            {list.map((item, index) => (
              <ShowroomRow
                key={item.slug}
                item={item}
                mirrored={index % 2 === 1}
              />
            ))}
          </div>
        </section>
      ) : null}

      <FullBleedBanner
        id="showrooms-visit"
        title={showroomsCopy.visitTitle}
        description={showroomsCopy.visitLead}
        align="center"
        minHeight="70svh"
        links={[
          {
            label: showroomsCopy.visitCta,
            href: showroomsCopy.visitHref,
          },
        ]}
        image={{
          src: showroomsVisitBanner.image,
          srcSet: heroSrcSet(showroomsVisitBanner.image),
          objectPosition: showroomsVisitBanner.objectPosition,
        }}
      />

      <div className="showrooms-page__footer-gap" aria-hidden="true" />
    </article>
  )
}
