import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { RoomTabs } from '../../components/catalog/RoomTabs'
import { Button } from '../../components/ui'
import { rooms } from '../../data/rooms'
import { Placeholder } from '../../components/Placeholder'
import {
  interiors,
  interiorsCopy,
  interiorsListHero,
} from '../../data/interiors'
import { useRevealOnce } from '../brands/useRevealOnce'
import { InteriorRow } from './InteriorRow'
import './InteriorsPage.css'

function heroSrcSet(src: string) {
  return `${src} 1280w, ${src} 1920w, ${src} 2560w`
}

export function InteriorsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const room = searchParams.get('room') || ''

  /* Только комнаты, у которых есть интерьеры; строка нужна при ≥2 интерьерах с комнатой */
  const roomsWithInteriors = rooms.filter((item) =>
    interiors.some((interior) => interior.room === item.slug),
  )
  const showRoomTabs =
    interiors.filter((interior) => interior.room).length >= 2 &&
    roomsWithInteriors.length > 0
  const visible = room
    ? interiors.filter((interior) => interior.room === room)
    : interiors

  const setRoom = (slug: string) => {
    const next = new URLSearchParams(searchParams)
    if (slug) next.set('room', slug)
    else next.delete('room')
    setSearchParams(next, { replace: true })
  }

  const [heroReady, setHeroReady] = useState(false)
  const [showScrollCue, setShowScrollCue] = useState(true)
  const introReveal = useRevealOnce<HTMLElement>()
  const rowsReveal = useRevealOnce<HTMLElement>()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setHeroReady(true)
      return undefined
    }
    const id = window.requestAnimationFrame(() => setHeroReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 24) setShowScrollCue(false)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <article className="interiors-page">
      <section
        className={['interiors-page__hero', heroReady ? 'is-ready' : ''].join(
          ' ',
        )}
        aria-labelledby="interiors-hero-title"
      >
        <div className="interiors-page__hero-media" data-reveal-media>
          {interiorsListHero.image ? (
            <img
              className="interiors-page__hero-img"
              src={interiorsListHero.image}
              srcSet={heroSrcSet(interiorsListHero.image)}
              sizes="100vw"
              alt=""
              width={2752}
              height={1536}
              loading="eager"
              fetchPriority="high"
              decoding="async"
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
          <h1 id="interiors-hero-title" className="interiors-page__title">
            {interiorsCopy.listHeroTitle}
          </h1>
          <p className="interiors-page__lead">{interiorsCopy.listHeroLead}</p>
        </div>
        <div
          className={[
            'interiors-page__scroll-cue',
            showScrollCue ? 'is-visible' : '',
          ].join(' ')}
          aria-hidden="true"
        />
      </section>

      <section
        ref={introReveal.nodeRef}
        className={[
          'interiors-page__band interiors-page__intro',
          introReveal.revealed ? 'is-in' : '',
        ].join(' ')}
        aria-labelledby="interiors-intro-label"
      >
        <div className="interiors-page__left interiors-page__intro-label-wrap">
          <span className="interiors-page__intro-rule" aria-hidden="true" />
          <h2 id="interiors-intro-label" className="interiors-page__intro-label">
            {interiorsCopy.introLabel}
          </h2>
        </div>
        <p className="interiors-page__right interiors-page__intro-text">
          {interiorsCopy.introText}
        </p>
      </section>

      {showRoomTabs ? (
        <section className="interiors-page__rooms" aria-label="Комнаты">
          <RoomTabs
            rooms={roomsWithInteriors}
            value={room}
            onChange={setRoom}
          />
        </section>
      ) : null}

      <section
        ref={rowsReveal.nodeRef}
        className={[
          'interiors-page__rows',
          rowsReveal.revealed ? 'is-in' : '',
        ].join(' ')}
        aria-label={interiorsCopy.introLabel}
      >
        {visible.length > 0 ? (
          visible.map((item, index) => (
            <InteriorRow
              key={item.slug}
              item={item}
              mirrored={index % 2 === 1}
            />
          ))
        ) : (
          <div className="interiors-page__empty" role="status">
            <p>Для этой комнаты интерьеров пока нет</p>
            <Button type="button" variant="secondary" onClick={() => setRoom('')}>
              Все интерьеры
            </Button>
          </div>
        )}
      </section>

      <div className="interiors-page__footer-gap" aria-hidden="true" />
    </article>
  )
}
