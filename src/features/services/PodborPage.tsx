import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Button,
  CircularSlider,
  SliderArrows,
  useCircularSlider,
} from '../../components/ui'
import { featureFlags } from '../../data/featureFlags'
import { podbor } from '../../data/services'
import { getInteriors } from '../../lib/interiors'
import { InteriorCard } from '../interiors/InteriorCard'
import '../../components/ui/Button.css'
import './PodborPage.css'

const COLS = 4

export function PodborPage() {
  const interiors = getInteriors()
  const slider = useCircularSlider(interiors.length)
  const visitHref = featureFlags.showShowrooms ? '/showrooms/' : '/contacts'

  return (
    <article className="services-page">
      <section className="services-hero" aria-labelledby="services-title">
        <img
          className="services-hero__img"
          src={podbor.heroImage}
          alt=""
          width={2752}
          height={1536}
          fetchPriority="high"
          decoding="async"
        />
        <div className="services-hero__scrim" aria-hidden="true" />
        <div className="services-hero__content">
          <h1 id="services-title" className="services-hero__title">
            {podbor.title}
          </h1>
          <p className="services-hero__intro">{podbor.intro}</p>
          <div className="services-hero__actions">
            <Button as="a" variant="inverse" href="#obsudit">
              {podbor.primaryCta}
            </Button>
            <Link className="services-hero__link" to={visitHref}>
              <span>{podbor.secondaryCta}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section
        id="etapy"
        className="services-section"
        aria-labelledby="services-steps-title"
      >
        <h2 id="services-steps-title" className="services-h2">
          {podbor.stepsTitle}
        </h2>
        <ol className="services-steps">
          {podbor.steps.map((step, index) => (
            <li
              key={step.num}
              className={[
                'services-step',
                index % 2 === 1 ? 'services-step--right' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <img
                className="services-step__media"
                src={step.image}
                alt=""
                loading="lazy"
              />
              <div className="services-step__text">
                <span className="services-step__num">{step.num}</span>
                <h3 className="services-step__title">{step.title}</h3>
                <p className="services-step__body">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {interiors.length > 0 ? (
        <section
          className="services-section"
          aria-labelledby="services-examples-title"
        >
          <div className="services-head">
            <h2 id="services-examples-title" className="services-h2">
              {podbor.examplesTitle}
            </h2>
            <div className="services-head__tools">
              <Link className="services-link" to="/interiors">
                <span>{podbor.examplesLink}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              {interiors.length > COLS ? (
                <SliderArrows
                  className="services-arrows"
                  prevLabel="Предыдущие интерьеры"
                  nextLabel="Следующие интерьеры"
                  onPrev={() => slider.go(-1)}
                  onNext={() => slider.go(1)}
                />
              ) : null}
            </div>
          </div>
          <CircularSlider
            items={interiors}
            slider={slider}
            cols={COLS}
            mobileWidth={78}
            renderItem={(item) => <InteriorCard item={item} />}
          />
        </section>
      ) : null}

      <section
        id="obsudit"
        className="services-section services-discuss"
        aria-labelledby="services-discuss-title"
      >
        <div>
          <h2 id="services-discuss-title" className="services-h2">
            {podbor.discussTitle}
          </h2>
          <p className="services-discuss__text">{podbor.discussText}</p>
        </div>
        <Button as={Link} variant="secondary" withArrow to={podbor.requestHref}>
          {podbor.primaryCta}
        </Button>
      </section>
    </article>
  )
}
