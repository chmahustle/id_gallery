import { Grid2x2, Grid3x3, ListFilter } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SORT_OPTIONS, type SortValue } from '../../catalog/catalog'
import type { Category } from '../../types'
import type { Room } from '../../data/rooms'
import type { CatalogView } from '../../features/catalog/useCatalogFilters'
import CatalogSelect from './CatalogSelect'

type CatalogToolbarProps = {
  allActive: boolean
  brand: string
  brands: string[]
  room: string
  rooms: Room[]
  category: string
  categories: Category[]
  extraFilterCount: number
  filtersOpen: boolean
  sort: SortValue
  view: CatalogView
  count?: number
  onBrandChange: (brand: string) => void
  onRoomChange: (room: string) => void
  onCategoryChange: (slug: string) => void
  onOpenFilters: (opener: HTMLElement) => void
  onSortChange: (sort: SortValue) => void
  onViewChange: (view: CatalogView) => void
}

function formatCount(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} товар`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} товара`
  return `${n} товаров`
}

/**
 * Строка над сеткой: «Все товары», бренд, комната, тип, остальные фильтры;
 * справа — фактическая выдача, сортировка, вид сетки.
 */
export default function CatalogToolbar({
  allActive,
  brand,
  brands,
  room,
  rooms,
  category,
  categories,
  extraFilterCount,
  filtersOpen,
  sort,
  view,
  count,
  onBrandChange,
  onRoomChange,
  onCategoryChange,
  onOpenFilters,
  onSortChange,
  onViewChange,
}: CatalogToolbarProps) {
  return (
    <div className="catalog-toolbar">
      <div className="catalog-toolbar__filters">
        <Link
          to="/catalog"
          className={`catalog-toolbar__all ${allActive ? 'is-active' : ''}`.trim()}
          aria-current={allActive ? 'page' : undefined}
        >
          Все товары
        </Link>
        {brands.length > 0 ? (
          <CatalogSelect
            className="catalog-select--toolbar"
            label=""
            placeholder="Бренд"
            value={brand}
            options={[
              { value: '', label: 'Все бренды' },
              ...brands.map((name) => ({ value: name, label: name })),
            ]}
            onChange={onBrandChange}
          />
        ) : null}
        {rooms.length > 0 ? (
          <CatalogSelect
            className="catalog-select--toolbar"
            label=""
            placeholder="Комната"
            value={room}
            options={[
              { value: '', label: 'Все комнаты' },
              ...rooms.map((item) => ({ value: item.slug, label: item.label })),
            ]}
            onChange={onRoomChange}
          />
        ) : null}
        {categories.length > 0 ? (
          <CatalogSelect
            className="catalog-select--toolbar"
            label=""
            placeholder="Тип"
            value={category}
            options={[
              { value: '', label: 'Все типы' },
              ...categories.map((item) => ({ value: item.slug, label: item.label })),
            ]}
            onChange={onCategoryChange}
          />
        ) : null}
        <button
          type="button"
          className="catalog-toolbar__more"
          aria-expanded={filtersOpen}
          aria-controls="catalog-filters"
          onClick={(event) => onOpenFilters(event.currentTarget)}
        >
          <ListFilter size={14} strokeWidth={1.4} aria-hidden="true" />
          <span>
            {extraFilterCount > 0
              ? `Ещё фильтры (${extraFilterCount})`
              : 'Ещё фильтры'}
          </span>
        </button>
      </div>

      <div className="catalog-toolbar__right">
        {typeof count === 'number' ? (
          <p className="catalog-toolbar__count" role="status">
            {formatCount(count)}
          </p>
        ) : null}
        <CatalogSelect
          className="catalog-select--toolbar catalog-select--sort"
          label=""
          placeholder="Сортировка"
          value={sort === 'default' ? '' : sort}
          options={SORT_OPTIONS.map((option) =>
            option.value === 'default' ? { ...option, value: '' } : option,
          )}
          onChange={(value) => onSortChange((value || 'default') as SortValue)}
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
