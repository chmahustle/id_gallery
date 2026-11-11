import { brands } from '../../data/brands'
import { homeBannerImages, homeSections } from '../../data/home'
import { FullBleedBanner } from './FullBleedBanner'

export function BrandsSection() {
  const copy = homeSections.brands
  const img = homeBannerImages.brands

  const links = [
    { label: copy.cta.label, href: copy.cta.href },
    ...brands.map((b) => ({
      label: b.name,
      href: `/brands/${b.slug}`,
      subtle: true,
    })),
  ]

  return (
    <FullBleedBanner
      id={copy.id}
      title={copy.title}
      description={copy.description}
      links={links}
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
  )
}
