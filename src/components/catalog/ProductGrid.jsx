import { ProductCard } from './ProductCard'

export default function ProductGrid({ products, view = 'grid3' }) {
  if (!products.length) {
    return null
  }

  return (
    <div className={`product-grid product-grid--${view}`}>
      {products.map((item) => (
        <ProductCard key={item.slug} item={item} />
      ))}
    </div>
  )
}
