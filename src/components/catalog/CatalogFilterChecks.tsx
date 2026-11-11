type CatalogFilterChecksProps = {
  values: string[]
  active: string[]
  onChange: (values: string[]) => void
}

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value]
}

export function CatalogFilterChecks({
  values,
  active,
  onChange,
}: CatalogFilterChecksProps) {
  return (
    <ul className="catalog-check-list">
      {values.map((value) => {
        const checked = active.includes(value)
        return (
          <li key={value}>
            <label className="catalog-check">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(toggleValue(active, value))}
              />
              <span className="catalog-check__box" aria-hidden="true" />
              <span className="catalog-check__label">{value}</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}
