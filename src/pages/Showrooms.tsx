import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { featureFlags } from '../data/featureFlags'
import { showroomsCopy } from '../data/showrooms'
import { ShowroomsPage } from '../features/showrooms/ShowroomsPage'

export default function Showrooms() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${showroomsCopy.heroTitle} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  if (!featureFlags.showShowrooms) {
    return <Navigate to="/" replace />
  }

  return (
    <SiteShell variant="overlay">
      <ShowroomsPage />
    </SiteShell>
  )
}
