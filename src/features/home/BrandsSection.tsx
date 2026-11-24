import { Button } from '../../components/ui'
import { brands } from '../../data/brands'
import { homeBannerImages, homeSections } from '../../data/home'
import { FullBleedBanner } from './FullBleedBanner'
import './home-sections.css'

export function BrandsSection() {
  const copy = homeSections.brands
  const img = homeBannerImages.brands

  return (
    <div className="home-brands">
      <FullBleedBanner
        id={copy.id}
        title={copy.title}
        links={[{ label: copy.cta.label, href: copy.cta.href }]}
        image={
          img.src
            ? {
                src: img.src,
                srcSet: img.srcSet,
                objectPosition: img.objectPosition,
              }
            : undefined
        }
      />
      {brands.length > 0 ? (
        <nav className="home-brands__strip" aria-label="Фабрики ID Gallery">
          <ul className="home-brands__list">
            {brands.map((brand) => (
              <li key={brand.slug}>
                <Button as="link" to={`/brands/${brand.slug}`} variant="link">
                  {brand.name}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}
