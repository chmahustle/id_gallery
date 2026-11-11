import type { ColorFacet } from '../../catalog/filter-facets'

type CatalogFilterSwatchesProps = {
  colors: ColorFacet[]
  active: string[]
  onChange: (values: string[]) => void
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value]
}

export function CatalogFilterSwatches({
  colors,
  active,
  onChange,
}: CatalogFilterSwatchesProps) {
  return (
    <ul className="catalog-swatch-grid">
      {colors.map((item) => {
        const selected = active.includes(item.name)
        return (
          <li key={item.id}>
            <button
              type="button"
              className={`catalog-swatch ${selected ? 'is-active' : ''}`}
              aria-pressed={selected}
              title={item.name}
              aria-label={item.name}
              onClick={() => onChange(toggleValue(active, item.name))}
            >
              <span
                className="catalog-swatch__chip"
                style={item.swatch ? { background: item.swatch } : undefined}
              />
              <span className="catalog-swatch__name">{item.name}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
