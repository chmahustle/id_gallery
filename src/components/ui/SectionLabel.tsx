import type { ReactNode } from 'react'
import './SectionLabel.css'

type SectionLabelProps = {
  /** id заголовка — для aria-labelledby секции */
  id?: string
  children: ReactNode
  className?: string
}

/** Подпись секции: линия + название капсом. Семантика h2, вид — подпись. */
export function SectionLabel({ id, children, className }: SectionLabelProps) {
  return (
    <div className={['section-label', className].filter(Boolean).join(' ')}>
      <span className="section-label__rule" aria-hidden="true" />
      <h2 id={id} className="section-label__text">
        {children}
      </h2>
    </div>
  )
}
