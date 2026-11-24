import { homeBannerImages, homeSections } from '../../data/home'
import { hasVerifiedShowrooms } from './showroomsVisibility'
import { FullBleedBanner } from './FullBleedBanner'

export function ShowroomsSection() {
  const copy = homeSections.showrooms
  if (!hasVerifiedShowrooms()) return null

  const img = homeBannerImages.showrooms

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
