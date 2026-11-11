import { homeBannerImages, homeSections } from '../../data/home'
import { FullBleedBanner } from './FullBleedBanner'

export function InteriorsSection() {
  const copy = homeSections.interiors
  const img = homeBannerImages.interiors

  return (
    <FullBleedBanner
      id={copy.id}
      title={copy.title}
      description={copy.description}
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
  )
}
