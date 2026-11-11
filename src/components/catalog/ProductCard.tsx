import { useState } from 'react'
import { Link } from 'react-router-dom'
import { productPath } from '../../catalog/catalog'
import { Placeholder } from '../Placeholder'
import type { Product } from '../../types'
import { resolveBrandName } from '../../lib/catalog'

type ProductCardProps = {
  item: Product
  /** Подпись CTA на медиа; по умолчанию «Узнать стоимость» */
  ctaLabel?: string
  /** Скрыть строку с названием бренда (например, на странице самого бренда) */
  hideBrand?: boolean
  /** Дополнительный класс карточки (например, пропорции фото в раскладке) */
  className?: string
}

export function ProductCard({
  item,
  ctaLabel = 'Узнать стоимость',
  hideBrand = false,
  className,
}: ProductCardProps) {
  const colors = item.variants || item.colors || []
  const [activeId, setActiveId] = useState(colors[0]?.id || null)
  const activeColor =
    colors.find((color) => color.id === activeId) || colors[0] || null
  const imageSrc = activeColor?.image || item.image || item.images?.[0] || ''
  const brandName = resolveBrandName(item)

  return (
    <article
      className={['product-grid__card', className].filter(Boolean).join(' ')}
    >
      <Link to={productPath(item.slug)} className="product-grid__media">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`${item.name}, ${brandName}${activeColor?.name ? `, ${activeColor.name}` : ''}`}
            loading="lazy"
            width={800}
            height={1000}
          />
        ) : (
          <Placeholder
            variant="light"
            label=""
            className="product-grid__ph"
          />
        )}
        <span className="product-grid__cta">{ctaLabel} →</span>
      </Link>

      {colors.length > 0 ? (
        <div
          className="product-grid__swatches"
          role="listbox"
          aria-label={`Цвета: ${item.name}`}
        >
          {colors.map((color) => {
            const selected = color.id === (activeColor?.id || null)
            return (
              <button
                key={color.id}
                type="button"
                role="option"
                aria-selected={selected}
                aria-label={color.name}
                title={color.name}
                className={`product-grid__swatch ${selected ? 'is-active' : ''}`}
                style={{
                  background:
                    color.swatch || color.hex || 'var(--color-swatch-fallback)',
                }}
                onClick={(event) => {
                  event.preventDefault()
                  setActiveId(color.id)
                }}
              />
            )
          })}
        </div>
      ) : null}

      <div className="product-grid__info">
        <p className="product-grid__category">
          {item.subcategory || item.category}
        </p>
        <h3 className="product-grid__name">
          <Link to={productPath(item.slug)}>{item.name}</Link>
        </h3>
        {hideBrand ? null : (
          <p className="product-grid__brand">{brandName}</p>
        )}
      </div>
    </article>
  )
}
