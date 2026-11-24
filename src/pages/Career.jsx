import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { careerCopy } from '../data/career'
import { featureFlags } from '../data/featureFlags'
import { CareerPage } from '../features/career/CareerPage'

/** /career/ — «Карьера»: показывается, когда страница утверждена (флаг) */
export default function Career() {
  useEffect(() => {
    if (!featureFlags.showCareer) return undefined
    window.scrollTo(0, 0)
    document.title = `${careerCopy.title} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  if (!featureFlags.showCareer) return <Navigate to="/about" replace />

  return (
    <SiteShell variant="overlay">
      <CareerPage />
    </SiteShell>
  )
}
