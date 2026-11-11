import { Grid2x2, Grid3x3 } from 'lucide-react'
import { SORT_OPTIONS } from '../../catalog/catalog'
import CatalogSelect from './CatalogSelect'

function formatCount(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} товар`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} товара`
  return `${n} товаров`
}

export default function CatalogToolbar({
  sort,
  view,
  count,
  onSortChange,
  onViewChange,
}) {
  return (
    <div className="catalog-toolbar">
      <div className="catalog-toolbar__right">
        {typeof count === 'number' ? (
          <p className="catalog-toolbar__count" role="status">
            {formatCount(count)}
          </p>
        ) : null}
        <CatalogSelect
          className="catalog-select--toolbar"
          label=""
          value={sort}
          options={SORT_OPTIONS}
          onChange={onSortChange}
        />

        <div
          className="catalog-toolbar__views"
          role="group"
          aria-label="Вид сетки"
        >
          <button
            type="button"
            className={view === 'grid3' ? 'is-active' : undefined}
            aria-pressed={view === 'grid3'}
            aria-label="Три в ряд"
            onClick={() => onViewChange('grid3')}
          >
            <Grid3x3 size={16} strokeWidth={1.4} />
          </button>
          <button
            type="button"
            className={view === 'grid2' ? 'is-active' : undefined}
            aria-pressed={view === 'grid2'}
            aria-label="Два в ряд"
            onClick={() => onViewChange('grid2')}
          >
            <Grid2x2 size={16} strokeWidth={1.4} />
          </button>
        </div>
      </div>
    </div>
  )
}
