import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { Button } from '../../components/ui'
import { Placeholder } from '../../components/Placeholder'
import './FullBleedBanner.css'

export type BannerImage = {
  src?: string
  srcSet?: string
  alt?: string
  objectPosition?: string
}

export type BannerLink = {
  label: string
  href: string
  /** Мелкий второй ряд (категории / бренды) */
  subtle?: boolean
}

/** Плотность затемнения: default | strong | число 0–1 (множитель нижней α) */
export type ScrimStrength = 'default' | 'strong' | number

export type FullBleedBannerProps = {
  id: string
  title: string
  description?: string
  links?: BannerLink[]
  image?: BannerImage
  align?: 'center' | 'left'
  minHeight?: string
  scrimStrength?: ScrimStrength
}

function scrimStyle(strength: ScrimStrength = 'default'): CSSProperties {
  if (strength === 'default') return {}
  const mult = strength === 'strong' ? 1.15 : Math.min(Math.max(strength, 0.5), 1.4)
  const a0 = Math.min(0.72 * mult, 0.88)
  const a1 = Math.min(0.45 * mult, 0.7)
  return {
    background: `linear-gradient(
      to top,
      rgba(0, 0, 0, ${a0.toFixed(2)}) 0%,
      rgba(0, 0, 0, ${a1.toFixed(2)}) 40%,
      rgba(0, 0, 0, 0) 78%
    )`,
  }
}

export function FullBleedBanner({
  id,
  title,
  description,
  links = [],
  image,
  align = 'center',
  minHeight,
  scrimStrength = 'default',
}: FullBleedBannerProps) {
  const titleId = useId()
  const sectionRef = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)
  const hasImage = Boolean(image?.src)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true)
      return undefined
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRevealed(true)
          io.disconnect()
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const primary = links.filter((l) => !l.subtle)
  const subtle = links.filter((l) => l.subtle)

  return (
    <section
      ref={sectionRef}
      id={id}
      className={[
        'ff-banner',
        `ff-banner--${align}`,
        revealed ? 'is-revealed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={minHeight ? { minHeight } : undefined}
      aria-labelledby={titleId}
    >
      <div className="ff-banner__media" data-reveal-media aria-hidden="true">
        {hasImage ? (
          <img
            className="ff-banner__img"
            src={image!.src}
            srcSet={image!.srcSet}
            sizes="100vw"
            alt=""
            loading="lazy"
            decoding="async"
            style={
              image?.objectPosition
                ? { objectPosition: image.objectPosition }
                : undefined
            }
          />
        ) : (
          <Placeholder className="ff-banner__ph" label={title} />
        )}
        <div className="ff-banner__scrim" style={scrimStyle(scrimStrength)} />
      </div>

      <div className="ff-banner__content">
        <h2 id={titleId} className="ff-banner__title">
          {title}
        </h2>
        {description ? (
          <p className="ff-banner__desc">{description}</p>
        ) : null}
        {primary.length > 0 ? (
          <div className="ff-banner__cta">
            {primary.map((link) => (
              <Button
                key={`${link.href}-${link.label}`}
                as="link"
                to={link.href}
                variant="inverse"
                withArrow
              >
                {link.label}
              </Button>
            ))}
          </div>
        ) : null}
        {subtle.length > 0 ? (
          <div className="ff-banner__links ff-banner__links--subtle">
            {subtle.map((link) => (
              <Button
                key={`${link.href}-${link.label}`}
                as="link"
                to={link.href}
                variant="link"
                subtle
              >
                {link.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
