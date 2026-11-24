import { useEffect } from 'react'
import SiteShell from '../components/SiteShell'
import { ComparePage } from '../features/compare/ComparePage'

/** /compare/ — сравнение 2–4 моделей одного типа */
export default function Compare() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Сравнение — ID Gallery'
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  return (
    <SiteShell variant="solid">
      <ComparePage />
    </SiteShell>
  )
}
