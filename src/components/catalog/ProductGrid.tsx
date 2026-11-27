import type { CSSProperties } from 'react'
import type { Product } from '../../types'
import { ProductCard } from './ProductCard'

/** Сколько первых карточек появляются по очереди; остальные — вместе с последней */
const STAGGER_LIMIT = 8

/**
 * Сетка каталога. animationKey меняется при смене фильтров —
 * сетка пересобирается, карточки плавно проявляются (Catalog.css).
 */
type ProductGridProps = {
  products: Product[]
  view?: string
  animationKey?: string
  animate?: boolean
}

export default function ProductGrid({
  products,
  view = 'grid3',
  animationKey,
  animate = true,
}: ProductGridProps) {
  if (!products.length) {
    return null
  }

  return (
    <div
      key={animationKey}
      className={`product-grid product-grid--${view} ${
        animate ? 'product-grid--animated' : ''
      }`.trim()}
    >
      {products.map((item, index) => (
        <div
          key={item.slug}
          className="product-grid__cell"
          style={{ '--card-i': Math.min(index, STAGGER_LIMIT) } as CSSProperties}
        >
          <ProductCard item={item} />
        </div>
      ))}
    </div>
  )
}
