import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import { Button, Reveal } from '../../components/ui'
import { podbor, type ServicesBlockId, servicesLayout } from '../../data/services'
import { FullBleedBanner } from '../home/FullBleedBanner'
import '../../components/ui/Button.css'
import './PodborPage.css'

function srcSet(src: string) {
  return `${src} 1280w, ${src} 1920w, ${src} 2560w`
}

/** Первый экран */
export function ServicesHero() {
  return (
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
          <Button as={Link} variant="inverse" withArrow to={podbor.requestHref}>
            {podbor.primaryCta}
          </Button>
        </div>
      </div>
    </section>
  )
}

/** Направления */
export function ServicesAbout() {
  return (
    <>
      {/* —— Направления —— */}
      <section className="services-section" aria-labelledby="services-about-title">
        <div className="services-intro">
          <h2 id="services-about-title" className="services-h2">
            {podbor.aboutTitle}
          </h2>
          <p className="services-lead">{podbor.aboutText}</p>
        </div>
        <Reveal as="ul" className="services-directions" stagger>
          {podbor.directions.map((item) => (
            <li key={item.title} className="services-direction">
              <span className="services-direction__media">
                <img src={item.image} alt="" loading="lazy" />
              </span>
              <h3 className="services-h3">{item.title}</h3>
              <p className="services-text">{item.text}</p>
            </li>
          ))}
        </Reveal>
      </section>
    </>
  )
}

/** Как мы работаем */
export function ServicesSteps() {
  return (
    <>
      {/* —— Как мы работаем —— */}
      <section id="etapy" className="services-section" aria-labelledby="services-steps-title">
        <h2 id="services-steps-title" className="services-h2">
          {podbor.stepsTitle}
        </h2>
        <ol className="services-steps">
          {podbor.steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.num}
              className={['services-step', index % 2 ? 'services-step--flip' : '']
                .filter(Boolean)
                .join(' ')}
            >
              <span className="services-step__media">
                <img src={step.image} alt="" loading="lazy" />
              </span>
              <div className="services-step__body">
                <span className="services-step__num" aria-hidden="true">
                  {step.num}
                </span>
                <h3 className="services-h3">{step.title}</h3>
                <p className="services-text">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  )
}

/** Что вы получаете / Ваш следующий шаг */
export function ServicesNext() {
  return (
    <>
      {/* —— Что вы получаете / Ваш следующий шаг —— */}
      <section id="obsudit" className="services-next" aria-label={podbor.nextTitle}>
        <Reveal className="services-next__inner" stagger>
          <div className="services-next__col">
            <h2 className="services-h2 services-h2--sm">{podbor.resultTitle}</h2>
            <p className="services-lead">{podbor.resultText}</p>
          </div>
          <div className="services-next__col">
            <h2 className="services-h2 services-h2--sm">{podbor.nextTitle}</h2>
            <p className="services-lead">{podbor.nextText}</p>
            <Button as={Link} variant="primary" withArrow to={podbor.requestHref}>
              {podbor.primaryCta}
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  )
}

/** Интерьеры и сочетания */
export function ServicesInteriors() {
  return (
    <>
      {/* —— Интерьеры и сочетания —— */}
      <FullBleedBanner
        id="services-interiors"
        title={podbor.interiorsTitle}
        description={podbor.interiorsText}
        align="left"
        minHeight="70svh"
        links={[{ label: podbor.interiorsLink, href: podbor.interiorsHref }]}
        image={{ src: podbor.interiorsImage, srcSet: srcSet(podbor.interiorsImage) }}
      />
    </>
  )
}

export const servicesBlockComponents: Record<ServicesBlockId, () => JSX.Element> = {
  about: ServicesAbout,
  steps: ServicesSteps,
  next: ServicesNext,
  interiors: ServicesInteriors,
}

/**
 * /services/podbor: первый экран и блоки в порядке servicesLayout (админка).
 * Обе кнопки «Обсудить проект» ведут в одну форму с сохранением услуги.
 */
export function PodborPage() {
  return (
    <article className="services-page">
      <ServicesHero />
      {servicesLayout.order.map((id) => {
        const Block = servicesBlockComponents[id]
        return <Block key={id} />
      })}
    </article>
  )
}
