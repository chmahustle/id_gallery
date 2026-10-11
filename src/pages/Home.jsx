import Header from '../components/Header'
import Hero from '../components/Hero'
import SaleBanner from '../components/SaleBanner'
import FullBleed from '../components/FullBleed'
import Membership from '../components/Membership'
import Sourcebooks from '../components/Sourcebooks'
import Explore from '../components/Explore'
import Newsletter from '../components/Newsletter'
import Footer from '../components/Footer'
import ScrollTop from '../components/ScrollTop'
import { useBrands } from '../brands/BrandsContext'
import { useMedia } from '../media/MediaContext'
import { useContent } from '../content/ContentContext'
import { useNews } from '../news/NewsContext'
import '../App.css'

export default function Home() {
  const { media, ready: mediaReady } = useMedia()
  const { content, ready: contentReady } = useContent()
  const { ready: newsReady } = useNews()
  const { ready: brandsReady } = useBrands()
  const { blocks } = content

  if (!mediaReady || !contentReady || !newsReady || !brandsReady) {
    return <div className="page" aria-busy="true" />
  }

  return (
    <div className="page">
      <a href="#main" className="skip-link">
        Перейти к содержимому
      </a>
      <Header />
      <main id="main">
        <Hero
          src={media.hero}
          title={blocks.heroTitle}
          alt={blocks.heroAlt}
        />
        <SaleBanner
          src={media.outdoor}
          title={blocks.outdoorTitle}
          alt={blocks.outdoorAlt}
        />

        <FullBleed
          poster={media.diningPoster}
          desktop={media.diningDesktop}
          mobile={media.diningMobile}
          alt="Фильм коллекции: гостиные и столовые ID Gallery"
        />

        <div id="collections">
          <section id="estates" className="rh-panel" aria-label="Каталог Estates">
            <img src={media.estates} alt={blocks.estatesAlt} />
          </section>

          <FullBleed
            poster={media.modernPoster}
            desktop={media.modernDesktop}
            mobile={media.modernMobile}
            alt="Фильм коллекции Modern"
          />

          <section id="modern" className="rh-panel" aria-label="Каталог Modern">
            <img src={media.modernBook} alt={blocks.modernAlt} />
          </section>

          <FullBleed
            poster={media.interiorsPoster}
            desktop={media.interiorsDesktop}
            mobile={media.interiorsMobile}
            alt="Фильм коллекции Interiors"
          />

          <section id="interiors" className="rh-panel" aria-label="Каталог Interiors">
            <img src={media.interiorsBook} alt={blocks.interiorsAlt} />
          </section>
        </div>

        <Membership
          src={media.membership}
          title={blocks.membershipTitle}
          alt={blocks.membershipAlt}
        />
        <Sourcebooks
          src={media.sourcebooks}
          title={blocks.sourcebooksTitle}
          alt={blocks.sourcebooksAlt}
        />
        <Explore
          gallery={media.exploreGallery}
          restaurant={media.exploreRestaurant}
          guesthouse={media.exploreGuesthouse}
          items={content.explore}
        />
        <Newsletter {...content.newsletter} />
      </main>
      <Footer />
      <ScrollTop />
    </div>
  )
}
