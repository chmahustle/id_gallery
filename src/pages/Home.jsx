import { lazy, Suspense, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Hero } from '../features/home/Hero'
import { homeHeroSlides, homeMeta } from '../data/home'
import '../App.css'

const HomeBelowFold = lazy(() => import('../features/home/HomeBelowFold'))

function setMetaDescription(content) {
  let el = document.querySelector('meta[name="description"]')
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', 'description')
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export default function Home() {
  useEffect(() => {
    const prevTitle = document.title
    document.title = homeMeta.title
    setMetaDescription(homeMeta.description)
    return () => {
      document.title = prevTitle
    }
  }, [])

  return (
    <div className="page">
      <a href="#main" className="skip-link">
        Перейти к содержимому
      </a>
      <Header variant="overlay" />
      <main id="main">
        <Hero slides={homeHeroSlides} />
        <Suspense
          fallback={
            <div
              className="home-below-fallback"
              style={{ minHeight: '40vh' }}
              aria-hidden="true"
            />
          }
        >
          <HomeBelowFold />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
