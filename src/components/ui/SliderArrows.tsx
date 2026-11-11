import { ChevronLeft, ChevronRight } from 'lucide-react'
import './SliderArrows.css'

export type SliderArrowsProps = {
  onPrev: () => void
  onNext: () => void
  prevLabel?: string
  nextLabel?: string
  className?: string
}

/** Круглые стрелки слайдеров: 40px, линия 1px, лёгкий шеврон */
export function SliderArrows({
  onPrev,
  onNext,
  prevLabel = 'Предыдущие',
  nextLabel = 'Следующие',
  className,
}: SliderArrowsProps) {
  return (
    <div className={['slider-arrows', className].filter(Boolean).join(' ')}>
      <button
        type="button"
        className="slider-arrows__btn"
        aria-label={prevLabel}
        onClick={onPrev}
      >
        <ChevronLeft size={14} strokeWidth={1} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="slider-arrows__btn"
        aria-label={nextLabel}
        onClick={onNext}
      >
        <ChevronRight size={14} strokeWidth={1} aria-hidden="true" />
      </button>
    </div>
  )
}
