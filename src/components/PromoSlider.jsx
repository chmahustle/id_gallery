import { useEffect, useState } from 'react'
import { promoSlides, site } from '../content'
import './PromoSlider.css'
import { Button } from './ui'

const INTERVAL_MS = 6000

export default function PromoSlider() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const slide = promoSlides[index]

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches || paused) return undefined

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % promoSlides.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [paused, index])

  return (
    <section
      className="promo"
      id="top"
      aria-roledescription="carousel"
      aria-label="Промо"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false)
        }
      }}
    >
      {promoSlides.map((item, i) => (
        <img
          key={item.id}
          src={item.image}
          alt=""
          className={`promo__img ${i === index ? 'is-active' : ''}`}
          aria-hidden={i !== index}
        />
      ))}
      <div className="promo__content">
        <p className="promo__eyebrow">{site.name}</p>
        <h1>{slide.title}</h1>
        <p className="promo__text">{slide.text}</p>
        <Button as="a" variant="primary" href={slide.href}>
          {slide.cta}
        </Button>
      </div>
      <div className="promo__dots" role="tablist" aria-label="Слайды">
        {promoSlides.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Слайд ${i + 1}: ${item.title}`}
            className={i === index ? 'is-active' : undefined}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  )
}
