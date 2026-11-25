import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { seoFor } from '../data/seo'

const DEFAULT_DESCRIPTION =
  typeof document !== 'undefined'
    ? document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
    : ''

/**
 * Заголовок вкладки и описание из админки («Для поисковиков»).
 * Стоит после маршрутов: срабатывает после того, как страница поставила свой заголовок.
 */
export function SeoManager() {
  const { pathname } = useLocation()

  useEffect(() => {
    if (pathname.startsWith('/admin')) return
    const seo = seoFor(pathname)
    if (seo?.title.trim()) document.title = seo.title.trim()
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', seo?.description.trim() || DEFAULT_DESCRIPTION)
  }, [pathname])

  return null
}
