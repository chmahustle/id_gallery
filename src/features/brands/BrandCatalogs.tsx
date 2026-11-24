import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CatalogCover } from '../../components/CatalogCover'
import {
  CircularSlider,
  SectionLabel,
  SliderArrows,
  useCircularSlider,
} from '../../components/ui'
import { featureFlags } from '../../data/featureFlags'
import type { BrandCatalog } from '../../types'

const COLS = 4

type BrandCatalogsProps = {
  brandSlug: string
  catalogs: BrandCatalog[]
}

/** «Каталоги и материалы» бренда — сразу после ассортимента; вход в общую библиотеку */
export function BrandCatalogs({ brandSlug, catalogs: all }: BrandCatalogsProps) {
  const catalogs = all.filter((item) => Boolean(item.url))
  const slider = useCircularSlider(catalogs.length)

  if (catalogs.length === 0) return null

  return (
    <section
      id="brand-catalogs"
      className="brand-page__section"
      aria-labelledby="brand-catalogs-title"
    >
      <div className="brand-page__showcase-head">
        <SectionLabel id="brand-catalogs-title">Каталоги и материалы</SectionLabel>
        <div className="brand-page__showcase-tools">
          {featureFlags.showMaterialsLibrary ? (
            <Link
              className="brand-page__section-link"
              to={`/materials/?brand=${encodeURIComponent(brandSlug)}`}
            >
              <span>Вся библиотека</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          ) : null}
          {catalogs.length > COLS ? (
            <SliderArrows
              className="brand-page__cat-arrows"
              prevLabel="Предыдущие каталоги"
              nextLabel="Следующие каталоги"
              onPrev={() => slider.go(-1)}
              onNext={() => slider.go(1)}
            />
          ) : null}
        </div>
      </div>
      <CircularSlider
        items={catalogs}
        slider={slider}
        cols={COLS}
        mobileWidth={70}
        renderItem={(item) => <CatalogCover item={item} />}
      />
    </section>
  )
}
