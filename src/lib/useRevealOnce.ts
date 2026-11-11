import { useEffect, useRef, useState } from 'react'

/** Появление при скролле один раз (opacity / translateY). */
export function useRevealOnce<T extends HTMLElement = HTMLElement>(
  rootMargin = '0px 0px -8% 0px',
) {
  const nodeRef = useRef<T | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = nodeRef.current
    if (!el) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true)
      return undefined
    }

    const reveal = () => setRevealed(true)

    const inViewNow = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 0
      return rect.top < vh * 0.92 && rect.bottom > vh * 0.08
    }

    if (inViewNow()) {
      reveal()
      return undefined
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal()
          io.disconnect()
        }
      },
      { rootMargin, threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return { nodeRef, revealed }
}
