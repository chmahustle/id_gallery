import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { useUserAuth } from '../../auth/UserAuthContext'
import { useCart } from '../../cart/CartContext'
import { featureFlags } from '../../data/featureFlags'
import { navigation } from '../../data/navigation'
import { useContent } from '../../content/ContentContext'
import CartPanel from '../CartPanel'
import SearchPanel from '../SearchPanel'
import '../Header.css'
import { CategoryNav } from './CategoryNav'
import { HeaderBar } from './HeaderBar'
import { MegaMenu } from './MegaMenu'
import {
  useHeaderState,
  type HeaderVariant,
} from './useHeaderState'

export type HeaderProps = {
  variant?: HeaderVariant
}

function useViewportMode() {
  const [accordion, setAccordion] = useState(false)
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    // Десктопное меню ≥1024px; аккордеон только <1024 (не pointer:coarse)
    const menuMq = window.matchMedia('(max-width: 1023px)')
    /* строка разделов — горизонтальная лента на планшете и мобильном */
    const narrowMq = window.matchMedia('(max-width: 1023px)')
    const sync = () => {
      setAccordion(menuMq.matches)
      setNarrow(narrowMq.matches)
    }
    sync()
    menuMq.addEventListener('change', sync)
    narrowMq.addEventListener('change', sync)
    return () => {
      menuMq.removeEventListener('change', sync)
      narrowMq.removeEventListener('change', sync)
    }
  }, [])
  return { accordion, narrow }
}

export function Header({ variant = 'overlay' }: HeaderProps) {
  const { content } = useContent()
  const { openCart, count: cartCount } = useCart()
  const { user } = useUserAuth()
  const utilityLinks = [
    ...(featureFlags.showShowrooms
      ? [{ label: 'Шоурумы', href: '/showrooms/' }]
      : []),
    { label: content.header?.contacts || 'Контакты', href: '/contacts' },
  ]
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const { accordion, narrow } = useViewportMode()

  const {
    collapsed,
    peek,
    requestPeek,
    endPeek,
    menuOpen,
    searchOpen,
    mobileSection,
    setMobileSection,
    closeMenu,
    toggleMenu,
    scheduleCloseMenu,
    clearCloseTimer,
    openSearch,
    closeSearch,
  } = useHeaderState({ menuButtonRef, searchButtonRef })

  useLayoutEffect(() => {
    const el = headerRef.current
    if (!el) return undefined

    const syncOffset = () => {
      document.documentElement.style.setProperty(
        '--header-offset',
        `${el.offsetHeight}px`,
      )
    }

    syncOffset()
    const observer = new ResizeObserver(syncOffset)
    observer.observe(el)
    window.addEventListener('resize', syncOffset)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncOffset)
    }
  }, [collapsed, menuOpen])

  const solid = variant === 'solid'

  const handleToggleMenu = () => {
    if (!menuOpen && accordion) {
      setMobileSection(navigation[0]?.title ?? null)
    }
    toggleMenu()
  }

  return (
    <>
      <header
        ref={headerRef}
        className={[
          'header',
          solid ? 'header--solid' : 'header--overlay',
          collapsed ? 'header--scrolled' : '',
          collapsed && !peek && !menuOpen && !searchOpen
            ? 'header--compact'
            : '',
          peek ? 'header--peek' : '',
          menuOpen ? 'header--menu-open' : '',
          searchOpen ? 'header--panel-open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onMouseEnter={() => {
          if (!accordion) clearCloseTimer()
          requestPeek()
        }}
        onMouseLeave={() => {
          endPeek()
          if (!accordion && menuOpen) scheduleCloseMenu()
        }}
        onFocusCapture={() => {
          if (!accordion) clearCloseTimer()
          requestPeek()
        }}
        onBlurCapture={(event) => {
          const next = event.relatedTarget as Node | null
          if (next && headerRef.current?.contains(next)) return
          endPeek()
        }}
      >
        <HeaderBar
          menuId={menuId}
          menuOpen={menuOpen}
          searchOpen={searchOpen}
          menuButtonRef={menuButtonRef}
          searchButtonRef={searchButtonRef}
          utilityLinks={utilityLinks}
          userLoggedIn={Boolean(user)}
          cartCount={cartCount}
          accordion={accordion}
          onToggleMenu={handleToggleMenu}
          onOpenSearch={openSearch}
          onOpenCart={() => openCart()}
        />

        <div className="header__cats-wrap">
          <CategoryNav
            className={narrow ? 'header__cats--scroll' : undefined}
          />
        </div>
      </header>

      <MegaMenu
        id={menuId}
        open={menuOpen}
        accordion={accordion}
        openSection={mobileSection}
        utilityLinks={utilityLinks}
        onToggleSection={(title) =>
          setMobileSection((current) => (current === title ? null : title))
        }
        onClose={() => closeMenu({ restoreFocus: true })}
        onNavigate={() => closeMenu()}
        onMouseEnterPanel={() => {
          if (!accordion) clearCloseTimer()
        }}
        onMouseLeavePanel={() => {
          if (!accordion) scheduleCloseMenu()
        }}
      />

      <SearchPanel
        open={searchOpen}
        onClose={() => closeSearch({ restoreFocus: true })}
      />
      {featureFlags.showCommerce ? <CartPanel /> : null}
    </>
  )
}

export default Header
