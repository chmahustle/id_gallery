import { Link } from 'react-router-dom'
import { brands } from '../../data/brands'
import { interiorsCopy } from '../../data/interiors'
import type { InteriorOrigin as Origin } from '../../types'

type InteriorOriginProps = {
  origin?: Origin
  /** detail — под фото страницы интерьера; row — над названием в списке */
  variant?: 'detail' | 'row'
}

/** «Интерьер бренда» / «Проект ID Gallery»: показывается только при данных */
export function InteriorOrigin({ origin, variant = 'detail' }: InteriorOriginProps) {
  if (!origin) return null

  const brand =
    origin.kind === 'brand'
      ? brands.find((item) => item.slug === origin.brand) || null
      : null
  if (origin.kind === 'brand' && !brand) return null

  const label =
    origin.kind === 'brand' ? interiorsCopy.originBrand : interiorsCopy.originGallery

  if (variant === 'row') {
    return (
      <p className="interior-origin interior-origin--row">
        {brand ? `${label} · ${brand.name}` : label}
      </p>
    )
  }

  return (
    <div className="interior-origin">
      <p className="interior-origin__label">{label}</p>
      <p className="interior-origin__text">
        {brand ? (
          <Link to={`/brands/${brand.slug}`}>{brand.name}</Link>
        ) : origin.kind === 'gallery' ? (
          `${interiorsCopy.originAuthor}: ${origin.author}`
        ) : null}
        {origin.photoSource ? (
          <span className="interior-origin__source">{origin.photoSource}</span>
        ) : null}
      </p>
    </div>
  )
}
