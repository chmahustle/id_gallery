import { featureFlags } from '../../data/featureFlags'
import { BannerStack } from './BannerStack'
import { BrandsSection } from './BrandsSection'
import { FeaturedSection } from './FeaturedSection'
import { InteriorsSection } from './InteriorsSection'
import { PartnersSection } from './PartnersSection'
import { ShowroomsSection } from './ShowroomsSection'

/** Секции ниже героя — lazy-chunk с главной */
export default function HomeBelowFold() {
  return (
    <>
      <BannerStack>
        <BrandsSection />
      </BannerStack>
      <FeaturedSection />
      <BannerStack>
        <InteriorsSection />
      </BannerStack>
      <PartnersSection />
      {featureFlags.showShowrooms ? (
        <BannerStack>
          <ShowroomsSection />
        </BannerStack>
      ) : null}
    </>
  )
}
