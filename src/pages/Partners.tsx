import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { tradeCopy } from '../data/trade'
import { TradePage } from '../features/trade/TradePage'

/** /trade/ — docs/content-brief.md §13 */
export default function Partners() {
  const { hash } = useLocation()

  useEffect(() => {
    /* якорь из меню: ждём закрытия меню (оно блокирует прокрутку) */
    const id = hash.slice(1)
    if (!id) {
      window.scrollTo(0, 0)
      return undefined
    }
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView()
    }, 150)
    return () => window.clearTimeout(timer)
  }, [hash])

  useEffect(() => {
    document.title = `${tradeCopy.heroTitle} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  return (
    <SiteShell variant="overlay">
      <TradePage />
    </SiteShell>
  )
}
