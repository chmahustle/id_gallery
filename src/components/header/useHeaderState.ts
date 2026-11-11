import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react'

const SCROLL_THRESHOLD = 8
const CLOSE_DELAY_MS = 180

export type HeaderVariant = 'overlay' | 'solid'

export function useHeaderState(options: {
  menuButtonRef: RefObject<HTMLButtonElement | null>
  searchButtonRef: RefObject<HTMLButtonElement | null>
}) {
  const { menuButtonRef, searchButtonRef } = options
  const [collapsed, setCollapsed] = useState(false)
  /**
   * Hover/focus expand while scrolled.
   * Blocked until pointer leaves the bar once after collapse — otherwise
   * staying over the header (or layout-shift mouseenter) immediately undoes compact.
   */
  const [peek, setPeek] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<string | null>(null)
  const closeTimer = useRef<number | null>(null)
  const rafId = useRef<number | null>(null)
  const collapsedRef = useRef(false)
  const allowPeekRef = useRef(false)

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const openMenu = useCallback(() => {
    clearCloseTimer()
    setSearchOpen(false)
    setMenuOpen(true)
  }, [clearCloseTimer])

  const closeMenu = useCallback(
    (opts?: { restoreFocus?: boolean }) => {
      clearCloseTimer()
      setMenuOpen(false)
      setMobileSection(null)
      if (opts?.restoreFocus) {
        window.requestAnimationFrame(() => menuButtonRef.current?.focus())
      }
    },
    [clearCloseTimer, menuButtonRef],
  )

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => {
      if (open) {
        setMobileSection(null)
        window.requestAnimationFrame(() => menuButtonRef.current?.focus())
        return false
      }
      setSearchOpen(false)
      return true
    })
  }, [menuButtonRef])

  const scheduleCloseMenu = useCallback(() => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => {
      setMenuOpen(false)
      setMobileSection(null)
      closeTimer.current = null
    }, CLOSE_DELAY_MS)
  }, [clearCloseTimer])

  const openSearch = useCallback(() => {
    setMenuOpen(false)
    setSearchOpen(true)
  }, [])

  const closeSearch = useCallback(
    (opts?: { restoreFocus?: boolean }) => {
      setSearchOpen(false)
      if (opts?.restoreFocus) {
        window.requestAnimationFrame(() => searchButtonRef.current?.focus())
      }
    },
    [searchButtonRef],
  )

  const requestPeek = useCallback(() => {
    if (!collapsedRef.current || !allowPeekRef.current) return
    setPeek(true)
  }, [])

  const endPeek = useCallback(() => {
    allowPeekRef.current = true
    setPeek(false)
  }, [])

  // Collapse when page has scrolled: sentinel + scroll fallback
  useEffect(() => {
    const readY = () =>
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0

    const applyCollapsed = (next: boolean) => {
      if (next === collapsedRef.current) return
      collapsedRef.current = next
      setCollapsed(next)
      setPeek(false)
      // After collapse, require leave→enter before expanding again
      allowPeekRef.current = !next
    }

    const syncFromScroll = () => {
      applyCollapsed(readY() > SCROLL_THRESHOLD)
    }

    const onScroll = () => {
      if (rafId.current != null) return
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null
        syncFromScroll()
      })
    }

    // In-flow sentinel at page top: leaves viewport ⇒ scrolled
    const host =
      document.querySelector('.page') ||
      document.getElementById('root') ||
      document.body
    const sentinel = document.createElement('div')
    sentinel.setAttribute('data-header-scroll-sentinel', '')
    sentinel.setAttribute('aria-hidden', 'true')
    Object.assign(sentinel.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '1px',
      height: `${SCROLL_THRESHOLD}px`,
      margin: '0',
      padding: '0',
      pointerEvents: 'none',
      opacity: '0',
      zIndex: '-1',
    })
    host.prepend(sentinel)

    const io = new IntersectionObserver(
      ([entry]) => {
        applyCollapsed(!(entry?.isIntersecting ?? true))
      },
      { root: null, threshold: 0 },
    )
    io.observe(sentinel)

    syncFromScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('scroll', onScroll, { passive: true, capture: true })
    return () => {
      io.disconnect()
      sentinel.remove()
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('scroll', onScroll, { capture: true })
      if (rafId.current != null) window.cancelAnimationFrame(rafId.current)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen && !searchOpen) return undefined
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (menuOpen) closeMenu({ restoreFocus: true })
      if (searchOpen) closeSearch({ restoreFocus: true })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen, searchOpen, closeMenu, closeSearch])

  useEffect(() => {
    if (!menuOpen) return undefined
    const scrollbar =
      window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPad
    }
  }, [menuOpen])

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  return {
    collapsed,
    peek,
    requestPeek,
    endPeek,
    menuOpen,
    searchOpen,
    mobileSection,
    setMobileSection,
    openMenu,
    closeMenu,
    toggleMenu,
    scheduleCloseMenu,
    clearCloseTimer,
    openSearch,
    closeSearch,
    setSearchOpen,
  }
}
