import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { aboutPage } from '../content'
import { useContent } from '../content/ContentContext'
import SiteShell from '../components/SiteShell'
import './About.css'

export default function About() {
  const { ready } = useContent()
  const page = aboutPage

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'О компании — ID Gallery'
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  if (!ready) {
    return <div className="page" aria-busy="true" />
  }

  return (
    <SiteShell variant="solid">
      <div className="about-page">
        <section className="about-hero" aria-labelledby="about-hero-title">
          <h1 id="about-hero-title">{page.title}</h1>
          <p className="about-hero__lead">{page.lead}</p>
          <p className="about-hero__lead about-hero__lead--secondary">
            {page.brandsIntro}
          </p>
        </section>

        <section className="about-perks" aria-label="Преимущества">
          <ul>
            {page.perks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="about-closing" aria-labelledby="about-closing-title">
          <div className="about-closing__media">
            <img
              src={page.image}
              alt="Интерьер шоурума ID Gallery"
              loading="lazy"
            />
          </div>
          <div className="about-closing__copy">
            <h2 id="about-closing-title" className="sr-only">
              Лимитированные коллекции и сервис
            </h2>
            <p>{page.closing}</p>
            <div className="about-closing__actions">
              <Link to="/brands" className="about-btn about-btn--solid">
                {page.ctaBrands}
              </Link>
              <Link to="/catalog" className="about-btn">
                {page.ctaCatalog}
              </Link>
              <Link to="/contacts" className="about-btn">
                {page.ctaTour}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  )
}
