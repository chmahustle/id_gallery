import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Placeholder } from '../../components/Placeholder'
import { Button } from '../../components/ui'
import {
  aboutApproach,
  aboutCopy,
  aboutListHero,
} from '../../data/about'
import { CropImage } from '../brands/CropImage'
import { useRevealOnce } from '../brands/useRevealOnce'
import { AboutBrandList } from './AboutBrandList'
import './AboutPage.css'

function heroSrcSet(src: string) {
  return `${src} 1280w, ${src} 1920w, ${src} 2560w`
}

export function AboutPage() {
  const [heroReady, setHeroReady] = useState(false)
  const approachReveal = useRevealOnce<HTMLElement>()
  const brandsReveal = useRevealOnce<HTMLElement>()

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
    <article className="about-page">
      <section
        className={['about-page__hero', heroReady ? 'is-ready' : ''].join(' ')}
        aria-labelledby="about-hero-title"
      >
        <div className="about-page__hero-media" data-reveal-media>
          {aboutListHero.image ? (
            <img
              className="about-page__hero-img"
              src={aboutListHero.image}
              srcSet={heroSrcSet(aboutListHero.image)}
              sizes="100vw"
              alt=""
              width={5376}
              height={3584}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{ objectPosition: aboutListHero.objectPosition }}
            />
          ) : (
            <Placeholder
              className="about-page__hero-ph"
              variant="default"
              label=""
            />
          )}
        </div>
        <div className="about-page__hero-scrim" aria-hidden="true" />
        <div className="about-page__hero-content">
          <h1 id="about-hero-title" className="about-page__title">
            {aboutCopy.heroTitle}
          </h1>
          <p className="about-page__lead">{aboutCopy.heroLead}</p>
        </div>
      </section>

      <section
        ref={approachReveal.nodeRef}
        className={[
          'about-page__approach',
          approachReveal.revealed ? 'is-in' : '',
        ].join(' ')}
        aria-labelledby="about-approach-label"
      >
        <div className="about-page__approach-media" data-reveal-media>
          <CropImage
            src={aboutApproach.image}
            focus={aboutApproach.imageFocus}
            zoom={aboutApproach.imageFocus.zoom}
            height={1000}
            alt=""
            className="about-page__approach-crop"
          />
        </div>
        <div className="about-page__approach-copy">
          <div className="about-page__label-wrap">
            <span className="about-page__label-rule" aria-hidden="true" />
            <h2 id="about-approach-label" className="about-page__label">
              {aboutCopy.approachLabel}
            </h2>
          </div>
          <p className="about-page__approach-text">{aboutCopy.approachText}</p>
          <Button
            as={Link}
            variant="secondary"
            withArrow
            to={aboutCopy.approachHref}
          >
            {aboutCopy.approachCta}
          </Button>
        </div>
      </section>

      <section
        ref={brandsReveal.nodeRef}
        className={[
          'about-page__brands',
          brandsReveal.revealed ? 'is-in' : '',
        ].join(' ')}
        aria-labelledby="about-brands-label"
      >
        <div className="about-page__label-wrap">
          <span className="about-page__label-rule" aria-hidden="true" />
          <h2 id="about-brands-label" className="about-page__label">
            {aboutCopy.brandsLabel}
          </h2>
        </div>
        <AboutBrandList />
        <div className="about-page__brands-cta">
          <Button
            as={Link}
            variant="secondary"
            withArrow
            to={aboutCopy.brandsHref}
          >
            {aboutCopy.brandsCta}
          </Button>
        </div>
      </section>

      <div className="about-page__footer-gap" aria-hidden="true" />
    </article>
  )
}
