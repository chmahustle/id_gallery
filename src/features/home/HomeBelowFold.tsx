import { BannerStack } from './BannerStack'
import { BrandsSection } from './BrandsSection'
import { FeaturedSection } from './FeaturedSection'
import { InteriorsSection } from './InteriorsSection'
import { PartnersSection } from './PartnersSection'
import { hasVerifiedShowrooms } from './showroomsVisibility'
import { ShowroomsSection } from './ShowroomsSection'

/** Секции ниже героя — lazy-chunk с главной */
export default function HomeBelowFold() {
  return (
    <>
      <FeaturedSection />
      <BannerStack>
        <BrandsSection />
        <InteriorsSection />
      </BannerStack>
      <PartnersSection />
      {hasVerifiedShowrooms() ? (
        <BannerStack>
          <ShowroomsSection />
        </BannerStack>
      ) : null}
    </>
  )
}
