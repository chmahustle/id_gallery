import CatalogSelect from './CatalogSelect'

function parsePriceInput(value) {
  if (value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export default function CatalogFilters({
  brands,
  statuses,
  bounds,
  filters,
  onChange,
}) {
  const brandOptions = [
    { value: '', label: 'Все бренды' },
    ...(filters.brand && !brands.includes(filters.brand)
      ? [filters.brand, ...brands]
      : brands
    ).map((brand) => ({ value: brand, label: brand })),
  ]
  const statusOptions = [
    { value: '', label: 'Все статусы' },
    ...(filters.status && !statuses.includes(filters.status)
      ? [filters.status, ...statuses]
      : statuses
    ).map((status) => ({ value: status, label: status })),
  ]

  return (
    <div className="catalog-filters" aria-label="Фильтры">
      <CatalogSelect
        label="Бренд"
        value={filters.brand}
        options={brandOptions}
        onChange={(brand) => onChange({ brand, page: 1 })}
      />

      <CatalogSelect
        label="Статус"
        value={filters.status}
        options={statusOptions}
        onChange={(status) => onChange({ status, page: 1 })}
      />

      {bounds ? (
        <>
          <label className="catalog-filters__field">
            <span>Цена от</span>
            <input
              type="number"
              min={bounds.min}
              max={bounds.max}
              placeholder={String(bounds.min)}
              value={filters.priceMin ?? ''}
              onChange={(e) =>
                onChange({
                  priceMin: parsePriceInput(e.target.value),
                  page: 1,
                })
              }
            />
          </label>
          <label className="catalog-filters__field">
            <span>Цена до</span>
            <input
              type="number"
              min={bounds.min}
              max={bounds.max}
              placeholder={String(bounds.max)}
              value={filters.priceMax ?? ''}
              onChange={(e) =>
                onChange({
                  priceMax: parsePriceInput(e.target.value),
                  page: 1,
                })
              }
            />
          </label>
        </>
      ) : null}

      {(filters.brand ||
        filters.status ||
        filters.priceMin != null ||
        filters.priceMax != null ||
        filters.sub) && (
        <button
          type="button"
          className="catalog-filters__reset"
          onClick={() =>
            onChange({
              brand: '',
              status: '',
              sub: '',
              priceMin: null,
              priceMax: null,
              page: 1,
            })
          }
        >
          Сбросить
        </button>
      )}
    </div>
  )
}
