import type { MouseEvent } from 'react'
import {
  CircularSlider,
  SectionLabel,
  SliderArrows,
  useCircularSlider,
} from '../../components/ui'
import type { BrandCatalog } from '../../types'

const COLS = 4

type BrandCatalogsProps = {
  catalogs: BrandCatalog[]
}

/** Заглушка «#» не должна уводить со страницы */
const stay = (url: string) => (event: MouseEvent) => {
  if (url === '#') event.preventDefault()
}

function CatalogCard({ item }: { item: BrandCatalog }) {
  return (
    <>
      <div className="brand-page__cat-cover">
        <a
          className="brand-page__cat-open"
          href={item.url}
          target="_blank"
          rel="noopener"
          aria-label={`Открыть ${item.title}`}
          onClick={stay(item.url)}
        >
          {item.cover ? (
            <img src={item.cover} alt="" loading="lazy" />
          ) : (
            <span className="brand-page__cat-tile">{item.title}</span>
          )}
        </a>
        <a
          className="ui-btn brand-page__cat-download"
          href={item.url}
          download
          onClick={stay(item.url)}
        >
          Скачать PDF
        </a>
      </div>
      <p className="brand-page__cat-title">{item.title}</p>
      <p className="brand-page__cat-format">{item.format}</p>
    </>
  )
}

export function BrandCatalogs({ catalogs: all }: BrandCatalogsProps) {
  const catalogs = all.filter((item) => Boolean(item.url))
  const slider = useCircularSlider(catalogs.length)

  if (catalogs.length === 0) return null

  return (
    <section
      className="brand-page__section"
      aria-labelledby="brand-catalogs-title"
    >
      <div className="brand-page__showcase-head">
        <SectionLabel id="brand-catalogs-title">Каталоги</SectionLabel>
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
      <CircularSlider
        items={catalogs}
        slider={slider}
        cols={COLS}
        mobileWidth={70}
        renderItem={(item) => <CatalogCard item={item} />}
      />
    </section>
  )
}
