import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { accountPageCopy } from '../data/account-page'
import { featureFlags } from '../data/featureFlags'
import { AccountPage } from '../features/account/AccountPage'

/** /account/ — docs/content-brief.md §17c; без PageShell (отступ задаёт hero) */
export default function Account() {
  useEffect(() => {
    if (!featureFlags.showAccount) return undefined
    window.scrollTo(0, 0)
    document.title = `${accountPageCopy.heroTitle} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  if (!featureFlags.showAccount) {
    return <Navigate to="/" replace />
  }

  return (
    <SiteShell variant="solid">
      <AccountPage />
    </SiteShell>
  )
}
