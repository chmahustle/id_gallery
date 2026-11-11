import { Button } from '../../components/ui'
import { Placeholder } from '../../components/Placeholder'
import { homeHero, type HeroSlide } from '../../data/home'
import './Hero.css'

export type HeroProps = {
  slides: HeroSlide[]
  activeIndex?: number
}

export function Hero({ slides, activeIndex = 0 }: HeroProps) {
  if (!slides.length) return null

  const index = Math.min(Math.max(activeIndex, 0), slides.length - 1)
  const slide = slides[index]
  const position = slide.objectPosition || '18% 72%'
  const hasImage = Boolean(slide.image)

  return (
    <section className="home-hero" id="top" aria-label={homeHero.title}>
      <div className="home-hero__media">
        {hasImage ? (
          <picture>
            {slide.sources?.map((source) => (
              <source
                key={source.srcSet}
                srcSet={source.srcSet}
                type={source.type}
                sizes={source.sizes || slide.sizes || '100vw'}
              />
            ))}
            <img
              className="home-hero__img"
              src={slide.image}
              srcSet={slide.srcSet}
              sizes={slide.sizes || '100vw'}
              alt={slide.alt}
              width={2752}
              height={1536}
              fetchPriority="high"
              decoding="async"
              style={{ objectPosition: position }}
            />
          </picture>
        ) : (
          <Placeholder className="home-hero__ph" showBadge label={slide.alt} />
        )}
        <div className="home-hero__scrim" aria-hidden="true" />
      </div>

      <div className="home-hero__content">
        <h1 className="home-hero__title">{homeHero.title}</h1>
        <p className="home-hero__subtitle">{homeHero.subtitle}</p>
        <div className="home-hero__actions">
          <Button as="link" to={homeHero.primaryCta.href} variant="primary" fullWidthMobile>
            {homeHero.primaryCta.label}
          </Button>
          <Button as="link" to={homeHero.secondaryCta.href} variant="inverse">
            {homeHero.secondaryCta.label}
          </Button>
        </div>
      </div>

      <div className="home-hero__scroll" aria-hidden="true">
        <span className="home-hero__scroll-line" />
      </div>
    </section>
  )
}

export default Hero
