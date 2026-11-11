import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  CircularSlider,
  SectionLabel,
  SliderArrows,
  useCircularSlider,
} from '../../components/ui'
import { InteriorCard } from '../interiors/InteriorCard'
import type { InteriorSelection } from '../../types'

const COLS = 4

type BrandInteriorsProps = {
  interiors: InteriorSelection[]
}

export function BrandInteriors({ interiors }: BrandInteriorsProps) {
  const slider = useCircularSlider(interiors.length)
  const arrows = interiors.length > COLS

  return (
    <section
      className="brand-page__section"
      aria-labelledby="brand-interiors-title"
    >
      <div className="brand-page__showcase-head">
        <SectionLabel id="brand-interiors-title">Интерьеры</SectionLabel>
        <div className="brand-page__showcase-tools">
          <Link className="brand-page__section-link" to="/interiors">
            <span>Все интерьеры</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          {arrows ? (
            <SliderArrows
              className="brand-page__int-arrows"
              prevLabel="Предыдущие интерьеры"
              nextLabel="Следующие интерьеры"
              onPrev={() => slider.go(-1)}
              onNext={() => slider.go(1)}
            />
          ) : null}
        </div>
      </div>
      <CircularSlider
        items={interiors}
        slider={slider}
        cols={COLS}
        mobileWidth={78}
        renderItem={(item) => <InteriorCard item={item} />}
      />
    </section>
  )
}
