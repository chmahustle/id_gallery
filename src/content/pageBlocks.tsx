import type { ReactNode } from 'react'
import { brands } from '../data/brands'
import {
  defaultHomeOrder,
  homeHeroSlides,
  homeLayout,
  homeSectionLabels,
  setHomeOrder,
} from '../data/home'
import {
  defaultServicesOrder,
  servicesBlockLabels,
  servicesLayout,
  setServicesOrder,
} from '../data/services'
import { AboutPage } from '../features/about/AboutPage'
import { BrandPage } from '../features/brands/BrandPage'
import { CareerPage } from '../features/career/CareerPage'
import { ContactPage } from '../features/contact/ContactPage'
import { BrandsSection } from '../features/home/BrandsSection'
import { FeaturedSection } from '../features/home/FeaturedSection'
import { Hero } from '../features/home/Hero'
import { InteriorsSection } from '../features/home/InteriorsSection'
import { PartnersSection } from '../features/home/PartnersSection'
import { ShowroomsSection } from '../features/home/ShowroomsSection'
import { InteriorsPage } from '../features/interiors/InteriorsPage'
import { ServicesHero, servicesBlockComponents } from '../features/services/PodborPage'
import { ShowroomsPage } from '../features/showrooms/ShowroomsPage'
import { MaterialsPage } from '../features/materials/MaterialsPage'
import { RequestConsultation } from '../features/request/RequestConsultation'
import { RoomsPage } from '../features/rooms/RoomsPage'
import { BrandsListBody } from '../pages/Brands'
import { TradePage } from '../features/trade/TradePage'

/**
 * Страницы конструктора в админке. Страница либо собрана из блоков,
 * которые можно переставлять (главная, услуги), либо рисуется целиком,
 * а блоки находятся по её секциям.
 */

export type OrderableBlock = { id: string; label: string; render: () => ReactNode }

export type PageConfig = {
  group: string
  label: string
  path: string
  /** Неподвижный первый блок (первый экран) */
  top?: OrderableBlock
  /** Блоки, порядок которых можно менять */
  blocks?: OrderableBlock[]
  orderKey?: string
  getOrder?: () => string[]
  setOrder?: (list: string[]) => string[]
  defaultOrder?: readonly string[]
  /** Класс обёртки страницы: от него зависят отступы и стили блоков */
  wrapperClass?: string
  /** Страница бренда: slug для выбора товаров, интерьеров и каталогов */
  brandSlug?: string
  /** Страница без копии: блоки — группы полей (каталог) */
  formOnly?: { id: string; label: string }[]
  /** Страница целиком (если блоки не переставляются) */
  render?: () => ReactNode
}

const homeRender: Record<string, () => ReactNode> = {
  featured: () => <FeaturedSection />,
  brands: () => <BrandsSection />,
  interiors: () => <InteriorsSection />,
  partners: () => <PartnersSection />,
  showrooms: () => <ShowroomsSection />,
}

/** Страницы конструктора; бренды — текущий список (с брендами из админки) */
export function getPageConfigs(): PageConfig[] {
  return [
    {
      group: 'Главная',
      label: 'Главная',
      path: '/',
      top: { id: 'hero', label: 'Первый экран', render: () => <Hero slides={homeHeroSlides} /> },
      blocks: Object.entries(homeSectionLabels).map(([id, label]) => ({
        id,
        label,
        render: homeRender[id]!,
      })),
      orderKey: 'home.order',
      getOrder: () => homeLayout.order,
      setOrder: (list) => setHomeOrder(list),
      defaultOrder: defaultHomeOrder,
    },
    {
      group: 'Услуги',
      label: 'Услуги',
      path: '/services/podbor',
      wrapperClass: 'services-page',
      top: { id: 'hero', label: 'Первый экран', render: () => <ServicesHero /> },
      blocks: Object.entries(servicesBlockLabels).map(([id, label]) => {
        const Block = servicesBlockComponents[id as keyof typeof servicesBlockComponents]
        return { id, label, render: () => <Block /> }
      }),
      orderKey: 'services.order',
      getOrder: () => servicesLayout.order,
      setOrder: (list) => setServicesOrder(list),
      defaultOrder: defaultServicesOrder,
    },
    ...brands.map((brand) => ({
      group: `Бренд ${brand.name}`,
      label: `Бренд ${brand.name}`,
      path: `/brands/${brand.slug}`,
      brandSlug: brand.slug,
      render: () => <BrandPage brand={brand} />,
    })),
    { group: 'Интерьеры', label: 'Интерьеры', path: '/interiors', render: () => <InteriorsPage /> },
    {
      group: 'Профессионалам',
      label: 'Профессионалам',
      path: '/trade',
      render: () => <TradePage />,
    },
    { group: 'О галерее', label: 'О галерее', path: '/about', render: () => <AboutPage /> },
    { group: 'Контакты', label: 'Контакты', path: '/contact', render: () => <ContactPage /> },
    { group: 'Шоурумы', label: 'Шоурумы', path: '/showrooms', render: () => <ShowroomsPage /> },
    { group: 'Карьера', label: 'Карьера', path: '/career', render: () => <CareerPage /> },
    {
      group: 'Каталог',
      label: 'Каталог',
      path: '/catalog',
      /* сами типы и комнаты — во вкладке «Типы и комнаты» */
      formOnly: [{ id: 'page', label: 'Страница «Все товары»' }],
    },
    { group: 'По комнатам', label: 'По комнатам', path: '/rooms', render: () => <RoomsPage /> },
    { group: 'Все бренды', label: 'Все бренды', path: '/brands', render: () => <BrandsListBody /> },
    {
      group: 'Каталоги и материалы',
      label: 'Каталоги и материалы',
      path: '/materials',
      render: () => <MaterialsPage />,
    },
    {
      group: 'Запись',
      label: 'Запись на консультацию',
      path: '/request?type=visit',
      render: () => (
        <article className="request-page">
          <RequestConsultation modelSlugs={[]} variantIds={[]} initialShowroom="" />
        </article>
      ),
    },
  ]
}
