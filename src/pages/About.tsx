import { useEffect } from 'react'
import SiteShell from '../components/SiteShell'
import { aboutCopy } from '../data/about'
import { AboutPage } from '../features/about/AboutPage'

/** /about/ — docs/content-brief.md §14 */
export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${aboutCopy.heroTitle} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  return (
    <SiteShell variant="overlay">
      <AboutPage />
    </SiteShell>
  )
}
