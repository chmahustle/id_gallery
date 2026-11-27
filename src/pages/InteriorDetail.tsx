import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { featureFlags } from '../data/featureFlags'
import { InteriorDetailPage } from '../features/interiors/InteriorDetailPage'
import { getInteriorBySlug } from '../lib/interiors'

export default function InteriorDetail() {
  const { interiorSlug } = useParams()
  const selection = getInteriorBySlug(interiorSlug || '')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [interiorSlug])

  useEffect(() => {
    if (!selection) return undefined
    document.title = `${selection.title} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [selection])

  if (!featureFlags.showInteriors) {
    return <Navigate to="/" replace />
  }

  if (!selection) {
    return <Navigate to="/interiors/" replace />
  }

  return (
    <SiteShell variant="overlay">
      <InteriorDetailPage selection={selection} />
    </SiteShell>
  )
}
