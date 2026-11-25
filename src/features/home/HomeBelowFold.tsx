import type { ReactNode } from 'react'
import { type HomeSectionId, homeLayout } from '../../data/home'
import { BannerStack } from './BannerStack'
import { BrandsSection } from './BrandsSection'
import { FeaturedSection } from './FeaturedSection'
import { InteriorsSection } from './InteriorsSection'
import { PartnersSection } from './PartnersSection'
import { hasVerifiedShowrooms } from './showroomsVisibility'
import { ShowroomsSection } from './ShowroomsSection'

/* баннеры на всю ширину идут лентой (BannerStack), остальные разделы — сами по себе */
const BANNERS = new Set<HomeSectionId>(['brands', 'interiors', 'showrooms'])

function renderSection(id: HomeSectionId): ReactNode {
  switch (id) {
    case 'featured':
      return <FeaturedSection key={id} />
    case 'brands':
      return <BrandsSection key={id} />
    case 'interiors':
      return <InteriorsSection key={id} />
    case 'partners':
      return <PartnersSection key={id} />
    case 'showrooms':
      return hasVerifiedShowrooms() ? <ShowroomsSection key={id} /> : null
    default:
      return null
  }
}

/** Секции ниже героя — lazy-chunk с главной; порядок из homeLayout (админка) */
export default function HomeBelowFold() {
  const blocks: ReactNode[] = []
  let stack: ReactNode[] = []
  const flush = () => {
    if (stack.length) blocks.push(<BannerStack key={`stack-${blocks.length}`}>{stack}</BannerStack>)
    stack = []
  }
  for (const id of homeLayout.order) {
    const node = renderSection(id)
    if (!node) continue
    if (BANNERS.has(id)) stack.push(node)
    else {
      flush()
      blocks.push(node)
    }
  }
  flush()
  return <>{blocks}</>
}
