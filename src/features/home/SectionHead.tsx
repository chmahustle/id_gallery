import AppLink from '../../components/AppLink'
import './home-sections.css'

type SectionHeadProps = {
  eyebrow?: string
  titleId: string
  title: string
  description?: string
  cta?: { label: string; href: string }
}

export function SectionHead({
  eyebrow,
  titleId,
  title,
  description,
  cta,
}: SectionHeadProps) {
  return (
    <div className="home-section__head">
      <div className="home-section__intro">
        {eyebrow ? <p className="home-section__eyebrow">{eyebrow}</p> : null}
        <h2 id={titleId} className="home-section__title">
          {title}
        </h2>
        {description ? (
          <p className="home-section__desc">{description}</p>
        ) : null}
      </div>
      {cta ? (
        <AppLink to={cta.href} className="home-section__more">
          <span className="home-section__more-label">{cta.label}</span>
          <span aria-hidden="true"> →</span>
        </AppLink>
      ) : null}
    </div>
  )
}
