import { useEffect, useId, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Placeholder } from '../../components/Placeholder'
import { Reveal } from '../../components/ui'
import {
  labelForBrandSlug,
  labelForModelSlug,
  labelForShowroomSlug,
  parseRequestType,
  requestAsideImage,
  requestPageCopy,
  type RequestType,
} from '../../data/request-page'
import { RequestOfferForm } from './RequestOfferForm'
import { RequestTabs } from './RequestTabs'
import { RequestVisitForm } from './RequestVisitForm'
import './RequestPage.css'

export function RequestPage() {
  const [params, setParams] = useSearchParams()
  const type = parseRequestType(params.get('type'))
  const modelSlug = params.get('model')
  const brandSlug = params.get('brand')
  const showroomSlug = params.get('showroom')
  const showroomPrefill = showroomSlug ? labelForShowroomSlug(showroomSlug) ?? '' : ''
  const tabsId = useId()
  const [ready, setReady] = useState(false)

  const offerPrefill =
    (modelSlug ? labelForModelSlug(modelSlug) : null) ??
    (brandSlug ? labelForBrandSlug(brandSlug) : null) ??
    ''
  const visitPrefill =
    (brandSlug ? labelForBrandSlug(brandSlug) : null) ??
    (modelSlug ? labelForModelSlug(modelSlug) : null) ??
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
  const visitTabId = `${tabsId}-visit`
  const offerPanelId = `${tabsId}-panel-offer`
  const visitPanelId = `${tabsId}-panel-visit`

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
            <Placeholder
              className="request-page__media-ph"
              variant="default"
              label=""
            />
          )}
        </div>

        <div className="request-page__main">
          <div className="request-page__panel">
            <RequestTabs baseId={tabsId} type={type} onChange={setType} />
            {type === 'offer' ? (
              <RequestOfferForm
                key={`offer-${offerPrefill}`}
                panelId={offerPanelId}
                labelledBy={offerTabId}
                initialModel={offerPrefill}
              />
            ) : (
              <RequestVisitForm
                key={`visit-${visitPrefill}-${showroomPrefill}`}
                panelId={visitPanelId}
                labelledBy={visitTabId}
                initialBrandOrModel={visitPrefill}
                initialShowroom={showroomPrefill}
              />
            )}
          </div>
        </div>
      </Reveal>

      <div className="request-page__footer-gap" aria-hidden="true" />
    </article>
  )
}
