import { useEffect, useState } from 'react'
import { Placeholder } from '../../components/Placeholder'
import {
  tradeCards,
  tradeCoopBanner,
  tradeCopy,
  tradeDesigners,
  tradeDevelopers,
  tradeIntroBlock,
  tradeListHero,
} from '../../data/trade'
import { FullBleedBanner } from '../home/FullBleedBanner'
import { useRevealOnce } from '../brands/useRevealOnce'
import { TradeCard } from './TradeCard'
import './TradePage.css'

function heroSrcSet(src: string) {
  return `${src} 1280w, ${src} 1920w, ${src} 2560w`
}

export function TradePage() {
  const [heroReady, setHeroReady] = useState(false)
  const cardsReveal = useRevealOnce<HTMLElement>()
  const devReveal = useRevealOnce<HTMLElement>()

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
    <article className="trade-page">
      <section
        className={['trade-page__hero', heroReady ? 'is-ready' : ''].join(' ')}
        aria-labelledby="trade-hero-title"
      >
        <div className="trade-page__hero-media" data-reveal-media>
          {tradeListHero.image ? (
            <img
              className="trade-page__hero-img"
              src={tradeListHero.image}
              srcSet={heroSrcSet(tradeListHero.image)}
              sizes="100vw"
              alt=""
              width={5376}
              height={3584}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{ objectPosition: tradeListHero.objectPosition }}
            />
          ) : (
            <Placeholder
              className="trade-page__hero-ph"
              variant="default"
              label=""
            />
          )}
        </div>
        <div className="trade-page__hero-scrim" aria-hidden="true" />
        <div className="trade-page__hero-content">
          <h1 id="trade-hero-title" className="trade-page__title">
            {tradeCopy.heroTitle}
          </h1>
          <p className="trade-page__lead">{tradeCopy.intro}</p>
        </div>
      </section>

      <section className="trade-intro" aria-label="Вступление">
        <p className="trade-intro__text">{tradeIntroBlock.text}</p>
      </section>

      <section
        id="designers"
        className="trade-designers"
        aria-labelledby="trade-designers-title"
      >
        <h2 id="trade-designers-title" className="trade-h2">
          {tradeDesigners.title}
        </h2>
        <section
          ref={cardsReveal.nodeRef}
          className={[
            'trade-page__cards',
            cardsReveal.revealed ? 'is-in' : '',
          ].join(' ')}
          aria-label={tradeCopy.heroTitle}
        >
          <div className="trade-page__cards-grid">
            {tradeCards.map((card) => (
              <TradeCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      </section>

      <section
        id="developers"
        className="trade-developers"
        aria-labelledby="trade-developers-title"
      >
        <h2 id="trade-developers-title" className="trade-h2">
          {tradeDevelopers.title}
        </h2>
        <section
          ref={devReveal.nodeRef}
          className={[
            'trade-page__cards',
            devReveal.revealed ? 'is-in' : '',
          ].join(' ')}
          aria-label={tradeDevelopers.title}
        >
          <div className="trade-page__cards-grid trade-page__cards-grid--3">
            {tradeDevelopers.cards.map((card) => (
              <TradeCard key={card.id} card={card} />
            ))}
          </div>
        </section>
      </section>

      <FullBleedBanner
        id="trade-coop"
        title={tradeCopy.coopTitle}
        description={tradeCopy.coopLead}
        align="center"
        minHeight="70svh"
        links={[
          {
            label: tradeCopy.coopCta,
            href: tradeCopy.coopHref,
          },
        ]}
        image={{
          src: tradeCoopBanner.image,
          srcSet: heroSrcSet(tradeCoopBanner.image),
          objectPosition: tradeCoopBanner.objectPosition,
        }}
      />

      <div className="trade-page__footer-gap" aria-hidden="true" />
    </article>
  )
}
