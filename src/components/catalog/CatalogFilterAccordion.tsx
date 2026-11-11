import { Minus, Plus } from 'lucide-react'
import type { ReactNode } from 'react'

type CatalogFilterAccordionProps = {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}

export function CatalogFilterAccordion({
  id,
  title,
  open,
  onToggle,
  children,
}: CatalogFilterAccordionProps) {
  const panelId = `${id}-panel`

  return (
    <section className="catalog-acc">
      <h2 className="catalog-acc__heading">
        <button
          type="button"
          className="catalog-acc__trigger"
          id={id}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{title}</span>
          {open ? (
            <Minus size={16} strokeWidth={1.4} aria-hidden="true" />
          ) : (
            <Plus size={16} strokeWidth={1.4} aria-hidden="true" />
          )}
        </button>
      </h2>
      <div
        id={panelId}
        role="region"
        aria-labelledby={id}
        className={`catalog-acc__panel ${open ? 'is-open' : ''}`}
        hidden={!open}
      >
        {children}
      </div>
    </section>
  )
}
