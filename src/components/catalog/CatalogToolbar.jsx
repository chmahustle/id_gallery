import { SORT_OPTIONS } from '../../catalog/catalog'
import CatalogSelect from './CatalogSelect'

export default function CatalogToolbar({ total, sort, onSortChange }) {
  return (
    <div className="catalog-toolbar">
      <p className="catalog-toolbar__count">
        {total} {pluralProducts(total)}
      </p>
      <CatalogSelect
        className="catalog-select--inline"
        label="Сортировка"
        value={sort}
        options={SORT_OPTIONS}
        onChange={onSortChange}
      />
    </div>
  )
}

function pluralProducts(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'товар'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'товара'
  return 'товаров'
}
