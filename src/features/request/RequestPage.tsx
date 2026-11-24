import { useEffect, useId, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Placeholder } from '../../components/Placeholder'
import { Reveal } from '../../components/ui'
import {
  labelForBrandSlug,
  labelForModels,
  parseRequestType,
  requestAsideImage,
  requestPageCopy,
  type RequestType,
} from '../../data/request-page'
import { RequestOfferForm } from './RequestOfferForm'
import { RequestTabs } from './RequestTabs'
import { RequestConsultation } from './RequestConsultation'
import './RequestPage.css'

export function RequestPage() {
  const [params, setParams] = useSearchParams()
  const type = parseRequestType(params.get('type'))
  const modelSlugs = params.getAll('model')
  const variantIds = params.getAll('variant')
  const brandSlug = params.get('brand')
  const showroomSlug = params.get('showroom')
  const tabsId = useId()
  const [ready, setReady] = useState(false)

  const offerPrefill =
    labelForModels(modelSlugs, variantIds) ??
    (brandSlug ? labelForBrandSlug(brandSlug) : null) ??
    ''

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setReady(true)
      return undefined
    }
    const id = window.requestAnimationFrame(() => setReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  function setType(next: RequestType) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('type', next)
    setParams(nextParams, { replace: true })
  }

  const offerTabId = `${tabsId}-offer`
  const offerPanelId = `${tabsId}-panel-offer`

  /* посещение — отдельный экран «Запланировать консультацию» */
  if (type === 'visit') {
    return (
      <article className="request-page">
        <RequestConsultation
          modelSlugs={modelSlugs}
          variantIds={variantIds}
          initialShowroom={showroomSlug || ''}
          initialAudience={
            params.get('audience') === 'pro'
              ? 'pro'
              : params.get('audience') === 'private'
                ? 'private'
                : null
          }
        />
        <div className="request-page__footer-gap" aria-hidden="true" />
      </article>
    )
  }

  return (
    <article className="request-page">
      <header
        className={['request-page__intro', ready ? 'is-ready' : ''].join(' ')}
        aria-labelledby="request-hero-title"
      >
        <h1 id="request-hero-title" className="request-page__title">
          {requestPageCopy.heroTitle}
        </h1>
        <p className="request-page__lead">{requestPageCopy.heroLead}</p>
      </header>

      <Reveal className="request-page__body" stagger>
        <div className="request-page__media" data-reveal-media>
          {requestAsideImage.image ? (
            <img
              className="request-page__media-img"
              src={requestAsideImage.image}
              alt=""
              width={requestAsideImage.width}
              height={requestAsideImage.height}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: requestAsideImage.objectPosition }}
            />
          ) : (
            <Placeholder className="request-page__media-ph" variant="default" label="" />
          )}
        </div>

        <div className="request-page__main">
          <div className="request-page__panel">
            <RequestTabs baseId={tabsId} type={type} onChange={setType} />
            <RequestOfferForm
              key={`offer-${offerPrefill}`}
              panelId={offerPanelId}
              labelledBy={offerTabId}
              initialModel={offerPrefill}
            />
          </div>
        </div>
      </Reveal>

      <div className="request-page__footer-gap" aria-hidden="true" />
    </article>
  )
}
