import { useEffect, useState } from 'react'
import { Placeholder } from '../../components/Placeholder'
import {
  contactListHero,
  contactPageCopy,
} from '../../data/contact-page'
import { featureFlags } from '../../data/featureFlags'
import { useRevealOnce } from '../brands/useRevealOnce'
import { ContactAsideMedia } from './ContactAsideMedia'
import { ContactForm } from './ContactForm'
import { ContactInfo } from './ContactInfo'
import './ContactPage.css'

function heroSrcSet(src: string) {
  return `${src} 1280w, ${src} 1920w, ${src} 2560w`
}

export function ContactPage() {
  const [heroReady, setHeroReady] = useState(false)
  const bodyReveal = useRevealOnce<HTMLElement>()
  const showForm = featureFlags.showContactForm

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
    <article className="contact-page">
      <section
        className={['contact-page__hero', heroReady ? 'is-ready' : ''].join(
          ' ',
        )}
        aria-labelledby="contact-hero-title"
      >
        <div className="contact-page__hero-media" data-reveal-media>
          {contactListHero.image ? (
            <img
              className="contact-page__hero-img"
              src={contactListHero.image}
              srcSet={heroSrcSet(contactListHero.image)}
              sizes="100vw"
              alt=""
              width={5824}
              height={3264}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{ objectPosition: contactListHero.objectPosition }}
            />
          ) : (
            <Placeholder
              className="contact-page__hero-ph"
              variant="default"
              label=""
            />
          )}
        </div>
        <div className="contact-page__hero-scrim" aria-hidden="true" />
        <div className="contact-page__hero-content">
          <h1 id="contact-hero-title" className="contact-page__title">
            {contactPageCopy.heroTitle}
          </h1>
          <p className="contact-page__lead">{contactPageCopy.heroLead}</p>
        </div>
      </section>

      <div
        ref={bodyReveal.nodeRef}
        className={[
          'contact-page__body',
          bodyReveal.revealed ? 'is-in' : '',
        ].join(' ')}
      >
        <div className="contact-page__left">
          <ContactInfo />
          <ContactAsideMedia />
        </div>
        {showForm ? <ContactForm /> : null}
      </div>

      <div className="contact-page__footer-gap" aria-hidden="true" />
    </article>
  )
}
