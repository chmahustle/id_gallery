import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MutableRefObject,
  type TransitionEvent,
} from 'react'
import type { AccountTab } from '../../data/account-page'
import { AccountLoginForm } from './AccountLoginForm'
import { AccountRegisterForm } from './AccountRegisterForm'

type AccountTabPanelsProps = {
  tab: AccountTab
  loginPanelId: string
  registerPanelId: string
  loginTabId: string
  registerTabId: string
  /** Вызвать до смены вкладки — фиксирует текущую высоту для анимации */
  heightLockRef: MutableRefObject<(() => void) | null>
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Высота = активная форма; при смене вкладки — 250ms ease-out.
 * Неактивная: hidden + inert, вне раскладки.
 */
export function AccountTabPanels({
  tab,
  loginPanelId,
  registerPanelId,
  loginTabId,
  registerTabId,
  heightLockRef,
}: AccountTabPanelsProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [heightPx, setHeightPx] = useState<number | null>(null)
  const isFirstTabEffect = useRef(true)

  heightLockRef.current = () => {
    const wrap = wrapRef.current
    if (!wrap || prefersReducedMotion()) return
    setHeightPx(wrap.getBoundingClientRect().height)
  }

  useLayoutEffect(() => {
    if (isFirstTabEffect.current) {
      isFirstTabEffect.current = false
      return
    }
    if (prefersReducedMotion()) {
      setHeightPx(null)
      return
    }
    const measure = measureRef.current
    if (!measure) return
    const next = measure.offsetHeight
    const id = window.requestAnimationFrame(() => {
      setHeightPx(next)
    })
    return () => window.cancelAnimationFrame(id)
  }, [tab])

  function onTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.propertyName !== 'height') return
    if (event.target !== wrapRef.current) return
    setHeightPx(null)
  }

  const style: CSSProperties | undefined =
    heightPx === null ? undefined : { height: `${heightPx}px` }

  return (
    <div
      ref={wrapRef}
      className="account-page__tabpanels"
      style={style}
      onTransitionEnd={onTransitionEnd}
    >
      <div ref={measureRef} className="account-page__tabpanels-measure">
        <div
          id={loginPanelId}
          role="tabpanel"
          aria-labelledby={loginTabId}
          className="account-page__tabpanel"
          hidden={tab !== 'login' || undefined}
          inert={tab !== 'login' ? true : undefined}
        >
          <AccountLoginForm formHidden={tab !== 'login'} />
        </div>
        <div
          id={registerPanelId}
          role="tabpanel"
          aria-labelledby={registerTabId}
          className="account-page__tabpanel"
          hidden={tab !== 'register' || undefined}
          inert={tab !== 'register' ? true : undefined}
        >
          <AccountRegisterForm formHidden={tab !== 'register'} />
        </div>
      </div>
    </div>
  )
}
