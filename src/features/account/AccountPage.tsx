import { useEffect, useId, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Placeholder } from '../../components/Placeholder'
import {
  accountListHero,
  accountPageCopy,
  accountProBanner,
  parseAccountTab,
  type AccountTab,
} from '../../data/account-page'
import { useUserAuth } from '../../auth/UserAuthContext'
import { labelForModelSlug } from '../../data/request-page'
import { useSelection } from '../../selection/SelectionContext'
import { AccountSelection } from './AccountSelection'
import { FullBleedBanner } from '../home/FullBleedBanner'
import { AccountTabPanels } from './AccountTabPanels'
import { AccountTabs } from './AccountTabs'
import './AccountPage.css'

function heroSrcSet(src: string) {
  return `${src} 1280w, ${src} 1920w, ${src} 2560w`
}

export function AccountPage() {
  const [params, setParams] = useSearchParams()
  const tab = parseAccountTab(params.get('tab'))
  /* пришли с «Сохранить в подборку»: модель и исполнение ждут входа */
  const modelSlug = params.get('model')
  const savingLabel = modelSlug
    ? labelForModelSlug(modelSlug, params.get('variant'))
    : null
  const { user } = useUserAuth()
  const selection = useSelection()
  const tabsId = useId()
  const [heroReady, setHeroReady] = useState(false)

  /* после входа: сохранить модель и исполнение, с которыми пришли, и убрать их из адреса */
  const variantParam = params.get('variant') || ''
  useEffect(() => {
    if (!user || !modelSlug) return
    selection.save(modelSlug, variantParam)
    const next = new URLSearchParams(params)
    next.delete('model')
    next.delete('variant')
    next.delete('tab')
    setParams(next, { replace: true })
  }, [user, modelSlug, variantParam, selection, params, setParams])
  const heightLockRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setHeroReady(true)
      return undefined
    }
    const id = window.requestAnimationFrame(() => setHeroReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  function setTab(next: AccountTab) {
    heightLockRef.current?.()
    const nextParams = new URLSearchParams(params)
    nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  if (user) {
    return (
      <article className="account-page">
        <AccountSelection />
      </article>
    )
  }

  const loginPanelId = `${tabsId}-panel-login`
  const registerPanelId = `${tabsId}-panel-register`
  const loginTabId = `${tabsId}-login`
  const registerTabId = `${tabsId}-register`

  return (
    <article className="account-page">
      <section
        className={['account-page__hero', heroReady ? 'is-ready' : ''].join(
          ' ',
        )}
        aria-labelledby="account-hero-title"
      >
        <div
          className="account-page__hero-media"
          data-reveal-media
          aria-hidden="true"
        >
          {accountListHero.image ? (
            <img
              className="account-page__hero-img"
              src={accountListHero.image}
              srcSet={heroSrcSet(accountListHero.image)}
              sizes="100vw"
              alt=""
              width={2752}
              height={1536}
              fetchPriority="high"
              decoding="async"
              style={{ objectPosition: accountListHero.objectPosition }}
            />
          ) : (
            <Placeholder
              className="account-page__hero-ph"
              variant="default"
              label=""
            />
          )}
          <div className="account-page__hero-scrim" />
        </div>

        <div className="account-page__hero-grid">
          <div className="account-page__hero-copy">
            <h1 id="account-hero-title" className="account-page__title">
              {accountPageCopy.heroTitle}
            </h1>
            <p className="account-page__lead">
              {savingLabel
                ? `${accountPageCopy.saveLead} ${savingLabel}`
                : accountPageCopy.heroLead}
            </p>
          </div>

          <div className="account-page__panel">
            <AccountTabs baseId={tabsId} tab={tab} onChange={setTab} />
            <AccountTabPanels
              tab={tab}
              loginPanelId={loginPanelId}
              registerPanelId={registerPanelId}
              loginTabId={loginTabId}
              registerTabId={registerTabId}
              heightLockRef={heightLockRef}
            />
          </div>
        </div>
      </section>

      <div className="account-page__band-gap" aria-hidden="true" />

      <FullBleedBanner
        id="account-pro"
        title={accountPageCopy.proTitle}
        description={accountPageCopy.proText}
        align="center"
        minHeight="70svh"
        links={[
          {
            label: accountPageCopy.proCta,
            href: accountPageCopy.proHref,
          },
        ]}
        image={{
          src: accountProBanner.image,
          srcSet: heroSrcSet(accountProBanner.image),
          objectPosition: accountProBanner.objectPosition,
        }}
      />

      <div className="account-page__footer-gap" aria-hidden="true" />
    </article>
  )
}
