import { useEffect } from 'react'
import SiteShell from '../components/SiteShell'
import { contactPageCopy } from '../data/contact-page'
import { ContactPage } from '../features/contact/ContactPage'

/** /contact/ — docs/content-brief.md §15 */
export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${contactPageCopy.heroTitle} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  return (
    <SiteShell variant="overlay">
      <ContactPage />
    </SiteShell>
  )
}
