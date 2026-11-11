import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { brands, brandsPage } from '../data/brands'
import SiteShell from '../components/SiteShell'
import { Reveal } from '../components/ui'
import { BannerStack } from '../features/home/BannerStack'
import { FullBleedBanner } from '../features/home/FullBleedBanner'
import './Brands.css'

export default function Brands() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Бренды — ID Gallery'
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  return (
    <SiteShell variant="solid">
      <div className="brands-page">
        <nav className="page-crumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span aria-hidden="true">-</span>
          <span>Бренды</span>
        </nav>

        <Reveal as="header" className="brands-page__head">
          <h1>{brandsPage.title}</h1>
          <p className="brands-page__lead">{brandsPage.lead}</p>
          <nav className="brands-page__anchors" aria-label="Бренды на странице">
            {brands.map((brand) => (
              <a key={brand.slug} href={`#brand-${brand.slug}`}>
                {brand.name}
              </a>
            ))}
          </nav>
        </Reveal>
      </div>

      <BannerStack className="brands-banners">
        {brands.map((brand) => (
          <FullBleedBanner
            key={brand.slug}
            id={`brand-${brand.slug}`}
            title={brand.name}
            description={brand.description}
            scrimStrength={brand.slug === 'visionnaire' ? 'strong' : 'default'}
            links={[
              {
                label: brand.ctaLabel,
                href: `/brands/${brand.slug}`,
              },
            ]}
            image={
              brand.heroImage
                ? {
                    src: brand.heroImage,
                    srcSet: `${brand.heroImage} 1280w, ${brand.heroImage} 1920w, ${brand.heroImage} 2560w`,
                    objectPosition: '50% 45%',
                  }
                : undefined
            }
          />
        ))}
      </BannerStack>
    </SiteShell>
  )
}
