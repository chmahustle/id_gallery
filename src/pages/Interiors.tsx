import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { featureFlags } from '../data/featureFlags'
import { interiorsCopy } from '../data/interiors'
import { InteriorsPage } from '../features/interiors/InteriorsPage'

export default function Interiors() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${interiorsCopy.listHeroTitle} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  if (!featureFlags.showInteriors) {
    return <Navigate to="/" replace />
  }

  return (
    <SiteShell variant="overlay">
      <InteriorsPage />
    </SiteShell>
  )
}
