import { Button } from '../../components/ui'
import { brands } from '../../data/brands'
import {
  type BrandStripItem,
  homeBannerImages,
  homeBrandStrip,
  homeSections,
} from '../../data/home'
import { FullBleedBanner } from './FullBleedBanner'
import './home-sections.css'

export function BrandsSection() {
  const copy = homeSections.brands
  const img = homeBannerImages.brands
  /* полоса брендов: список из админки или все бренды каталога */
  const bySlug = new Map(brands.map((brand) => [brand.slug, brand]))
  const fallback: BrandStripItem[] = brands.map((brand) => ({ slug: brand.slug }))
  const links = (homeBrandStrip.items ?? fallback)
    .map((item) => {
      const brand = item.slug ? bySlug.get(item.slug) : undefined
      if (brand) return { label: item.label || brand.name, href: `/brands/${brand.slug}` }
      return item.label && item.href ? { label: item.label, href: item.href } : null
    })
    .filter((item): item is { label: string; href: string } => Boolean(item))

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
      {links.length > 0 ? (
        <nav className="home-brands__strip" aria-label="Фабрики ID Gallery">
          <ul className="home-brands__list">
            {links.map((link) => (
              <li key={`${link.href}-${link.label}`}>
                {/^https?:\/\//.test(link.href) ? (
                  <Button
                    as="a"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="link"
                  >
                    {link.label}
                  </Button>
                ) : (
                  <Button as="link" to={link.href} variant="link">
                    {link.label}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}
