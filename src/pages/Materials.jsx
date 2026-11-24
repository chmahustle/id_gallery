import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { featureFlags } from '../data/featureFlags'
import { materialsCopy } from '../data/materials'
import { MaterialsPage } from '../features/materials/MaterialsPage'

/** /materials/ — «Каталоги и материалы» */
export default function Materials() {
  useEffect(() => {
    if (!featureFlags.showMaterialsLibrary) return undefined
    window.scrollTo(0, 0)
    document.title = `${materialsCopy.title} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  if (!featureFlags.showMaterialsLibrary) {
    return <Navigate to="/contact/?topic=materials" replace />
  }

  return (
    <SiteShell variant="solid">
      <MaterialsPage />
    </SiteShell>
  )
}
