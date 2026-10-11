import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

/**
 * Кастомный select в стиле ID Gallery.
 * Нативный <select> нельзя нормально стилизовать (системный список).
 */
export default function CatalogSelect({
  label,
  value,
  options,
  onChange,
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()
  const selected =
    options.find((option) => option.value === value) || options[0]

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function choose(nextValue) {
    onChange(nextValue)
    setOpen(false)
  }

  return (
    <div
      className={`catalog-select ${open ? 'is-open' : ''} ${className}`.trim()}
      ref={rootRef}
    >
      {label ? <span className="catalog-select__label">{label}</span> : null}
      <button
        type="button"
        className="catalog-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="catalog-select__value">{selected?.label}</span>
        <ChevronDown
          className="catalog-select__chevron"
          strokeWidth={1.25}
          size={16}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <ul
          id={listId}
          className="catalog-select__list"
          role="listbox"
          aria-label={label || 'Выбор'}
        >
          {options.map((option) => {
            const active = option.value === value
            return (
              <li key={option.value || '__empty'}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={active ? 'is-active' : undefined}
                  onClick={() => choose(option.value)}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
