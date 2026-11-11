import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Placeholder } from '../../components/Placeholder'
import { Button, SectionLabel } from '../../components/ui'
import { getNextBrand } from '../../lib/catalog'
import { getBrandInteriors } from '../../lib/interiors'
import { getBrandFeatured } from '../../lib/brandShowcase'
import type { Brand } from '../../types'
import { NEXT_BRAND_LABEL } from './brandUiCopy'
import { BrandAuthors } from './BrandAuthors'
import { BrandCatalogs } from './BrandCatalogs'
import { BrandFeatured } from './BrandFeatured'
import { BrandInteriors } from './BrandInteriors'
import { useRevealOnce } from './useRevealOnce'
import '../../components/ui/Button.css'
import './BrandPage.css'

type BrandPageProps = {
  brand: Brand
}

function heroSrcSet(src: string) {
  return `${src} 1280w, ${src} 1920w, ${src} 2560w`
}

export function BrandPage({ brand }: BrandPageProps) {
  const catalogHref = `/catalog?brand=${encodeURIComponent(brand.slug)}`
  const requestHref = `/request/?type=offer&brand=${encodeURIComponent(brand.slug)}`
  const nextBrand = getNextBrand(brand.slug)
  const featured = getBrandFeatured(brand.slug)
  const brandInteriors = getBrandInteriors(brand.slug)

  const [heroReady, setHeroReady] = useState(false)
  const [showScrollCue, setShowScrollCue] = useState(true)
  const aboutReveal = useRevealOnce<HTMLElement>()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setHeroReady(true)
      return undefined
    }
    const id = window.requestAnimationFrame(() => setHeroReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 24) setShowScrollCue(false)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <article className="brand-page">
      <section
        className={['brand-page__hero', heroReady ? 'is-ready' : ''].join(' ')}
        aria-labelledby="brand-hero-title"
      >
        <div className="brand-page__hero-media">
          {brand.heroImage ? (
            <img
              className="brand-page__hero-img"
              src={brand.heroImage}
              srcSet={heroSrcSet(brand.heroImage)}
              sizes="100vw"
              alt=""
              width={1920}
              height={1080}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <Placeholder
              className="brand-page__hero-ph"
              variant="default"
              label=""
            />
          )}
        </div>
        {/* отдельный full-bleed слой — не внутри текстового блока */}
        <div className="brand-page__hero-scrim" aria-hidden="true" />

        <div className="brand-page__hero-content">
          <nav className="brand-page__crumbs" aria-label="Хлебные крошки">
            <Link to="/">Главная</Link>
            <span aria-hidden="true">—</span>
            <Link to="/brands">Бренды</Link>
            <span aria-hidden="true">—</span>
            <span>{brand.name}</span>
          </nav>
          <h1 id="brand-hero-title" className="brand-page__title">
            {brand.name}
          </h1>
          <p className="brand-page__lead">{brand.intro}</p>
          <div className="brand-page__hero-actions">
            <Button as={Link} variant="inverse" withArrow to={catalogHref}>
              {`Все товары ${brand.name}`}
            </Button>
          </div>
        </div>

        <div
          className={[
            'brand-page__scroll-cue',
            showScrollCue ? 'is-visible' : '',
          ].join(' ')}
          aria-hidden="true"
        />
      </section>

      <section
        ref={aboutReveal.nodeRef}
        className={[
          'brand-page__band brand-page__about',
          aboutReveal.revealed ? 'is-in' : '',
        ].join(' ')}
        aria-labelledby="brand-about-title"
      >
        <SectionLabel
          id="brand-about-title"
          className="brand-page__left brand-page__about-label-wrap"
        >
          О бренде
        </SectionLabel>
        <p className="brand-page__right brand-page__about-text brand-page__axis-start">
          {brand.about}
        </p>
      </section>

      {/* Порядок блоков: О бренде (только текст) → подборка товаров → интерьеры → (коллекции → материалы: пока скрыты) → авторы → каталоги →
          (коллекции → материалы → авторы → каталоги: данные в brand.*, интерфейса пока нет) */}
      {featured.length > 0 ? (
        <BrandFeatured
          brandName={brand.name}
          catalogHref={catalogHref}
          items={featured}
        />
      ) : null}

      {brandInteriors.length >= 3 ? (
        <BrandInteriors interiors={brandInteriors} />
      ) : null}

      {brand.authors?.length ? <BrandAuthors authors={brand.authors} /> : null}

      {brand.catalogs?.length ? (
        <BrandCatalogs catalogs={brand.catalogs} />
      ) : null}

      <section
        className="brand-page__request"
        aria-label={`Запрос по ${brand.name}`}
      >
        <div className="brand-page__request-inner">
          <div>
            <h2 className="brand-page__request-title">
              Запрос по {brand.name}
            </h2>
            <p className="brand-page__request-text">{brand.requestText}</p>
          </div>
          <Button as={Link} variant="secondary" withArrow to={requestHref}>
            Запросить предложение
          </Button>
        </div>
      </section>

      <Link
        to={`/brands/${nextBrand.slug}/`}
        className="brand-page__next-banner"
        aria-label={`${NEXT_BRAND_LABEL}: ${nextBrand.name}`}
      >
        <div className="brand-page__next-media">
          {nextBrand.heroImage ? (
            <img
              className="brand-page__next-img"
              src={nextBrand.heroImage}
              alt=""
              width={1920}
              height={1080}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <Placeholder
              className="brand-page__next-ph"
              variant="default"
              label=""
            />
          )}
        </div>
        <div className="brand-page__next-scrim" aria-hidden="true" />
        <div className="brand-page__next-content">
          <span className="brand-page__next-eyebrow">{NEXT_BRAND_LABEL}</span>
          <span className="brand-page__next-title-row">
            <span className="brand-page__next-name">{nextBrand.name}</span>
            <span className="brand-page__next-circle" aria-hidden="true">
              <ArrowRight
                className="brand-page__next-circle-arrow"
                size={28}
                strokeWidth={1.5}
              />
            </span>
          </span>
        </div>
      </Link>

      <div className="brand-page__banner-gap" aria-hidden="true" />
    </article>
  )
}
