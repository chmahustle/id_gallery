import { useEffect, useLayoutEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import {
  readScroll,
  saveScroll,
  trackLocation,
} from '../lib/navHistory'

/** Ничего не рисует: ведёт историю переходов и восстанавливает прокрутку при «Назад» */
export default function NavTracker() {
  const location = useLocation()
  const type = useNavigationType()
  trackLocation(location)

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() =>
        saveScroll(location.key, window.scrollY),
      )
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.cancelAnimationFrame(frame)
    }
  }, [location.key])

  useLayoutEffect(() => {
    if (type !== 'POP') return undefined
    const y = readScroll(location.key)
    if (y == null || y <= 0) return undefined
    /* страница дорисовывается и сама может прокрутить вверх — повторяем */
    const timers = [0, 60, 160, 320, 600].map((delay) =>
      window.setTimeout(() => {
        if (document.documentElement.scrollHeight >= y + window.innerHeight * 0.5) {
          window.scrollTo(0, y)
        }
      }, delay),
    )
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [location.key, type])

  return null
}
