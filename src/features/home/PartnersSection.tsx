import { Button, Reveal } from '../../components/ui'
import { homeBannerImages, homeSections } from '../../data/home'
import './home-sections.css'

export function PartnersSection() {
  const copy = homeSections.partners
  const img = homeBannerImages.partners
  const hasImage = Boolean(img.src)

  return (
    <Reveal
      as="section"
      className="home-section home-section--inverse"
      id={copy.id}
      aria-labelledby="home-partners-title"
    >
      <div className="home-partners">
        <div className="home-partners__copy">
          <h2 id="home-partners-title" className="home-section__title">
            {copy.title}
          </h2>
          <p className="home-section__desc">{copy.description}</p>
          <div className="home-partners__actions">
            <Button as="link" to={copy.clientCta.href} variant="inverse" withArrow>
              Клиентам: {copy.clientCta.label}
            </Button>
            <Button as="link" to={copy.cta.href} variant="inverse" withArrow>
              Специалистам: {copy.cta.label}
            </Button>
          </div>
        </div>
        <div className="home-partners__media" data-reveal-media>
          {hasImage ? (
            <img
              src={img.src}
              srcSet={img.srcSet}
              sizes="(min-width: 900px) 50vw, 100vw"
              alt=""
              width={1200}
              height={900}
              loading="lazy"
              decoding="async"
              style={
                img.objectPosition
                  ? { objectPosition: img.objectPosition }
                  : undefined
              }
            />
          ) : null}
        </div>
      </div>
    </Reveal>
  )
}
