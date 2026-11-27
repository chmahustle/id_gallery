import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { PageShell } from '../components/layout/PageShell'
import SiteShell from '../components/SiteShell'
import { featureFlags } from '../data/featureFlags'
import { requestPageCopy } from '../data/request-page'
import { RequestPage } from '../features/request/RequestPage'

/** /request/ — docs/content-brief.md §18 */
export default function Request() {
  useEffect(() => {
    if (!featureFlags.showRequestForms) return undefined
    window.scrollTo(0, 0)
    document.title = `${requestPageCopy.heroTitle} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  if (!featureFlags.showRequestForms) {
    return <Navigate to="/" replace />
  }

  return (
    <SiteShell variant="solid">
      <PageShell>
        <RequestPage />
      </PageShell>
    </SiteShell>
  )
}
