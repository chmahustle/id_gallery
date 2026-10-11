import { Link } from 'react-router-dom'
import { useCart } from '../../cart/CartContext'
import { formatPrice, productPath } from '../../catalog/catalog'

export default function ProductGrid({ products }) {
  const { addItem } = useCart()

  if (!products.length) {
    return (
      <p className="catalog-empty" role="status">
        По выбранным фильтрам товаров нет. Сбросьте фильтры или выберите другую
        категорию.
      </p>
    )
  }

  return (
    <div className="product-grid">
      {products.map((item) => (
        <article key={item.slug} className="product-grid__card">
          <Link to={productPath(item.slug)} className="product-grid__media">
            <img
              src={item.image || item.images?.[0]}
              alt={`${item.name}, ${item.brand}`}
              loading="lazy"
            />
          </Link>
          <p className="product-grid__brand">{item.brand}</p>
          <h3 className="product-grid__name">
            <Link to={productPath(item.slug)}>{item.name}</Link>
          </h3>
          <p className="product-grid__meta">
            <span>{item.status}</span>
            <span>{formatPrice(item)}</span>
          </p>
          <div className="product-grid__actions">
            <button type="button" onClick={() => addItem(item)}>
              В корзину
            </button>
            <Link to={productPath(item.slug)}>Подробнее</Link>
          </div>
        </article>
      ))}
    </div>
  )
}
