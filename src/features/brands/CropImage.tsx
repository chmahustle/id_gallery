import type { CSSProperties } from 'react'
import type { BrandDetailFocus } from '../../types'
import './CropImage.css'

type CropImageProps = {
  src: string
  focus: Pick<BrandDetailFocus, 'x' | 'y'>
  zoom: number
  className?: string
  /** Фиксированная высота кадра (px) */
  height: number
  alt?: string
  style?: CSSProperties
  /** Первый экран — без lazy */
  priority?: boolean
}

/**
 * Увеличенный фрагмент кадра через object-position + scale.
 * zoom в диапазоне 1.6–2.4.
 */
export function CropImage({
  src,
  focus,
  zoom,
  className,
  height,
  alt = '',
  style,
  priority = false,
}: CropImageProps) {
  const z = Math.min(2.4, Math.max(1.6, zoom))
  const ox = `${focus.x}%`
  const oy = `${focus.y}%`

  return (
    <div
      className={['crop-image', className].filter(Boolean).join(' ')}
      style={{ ...style, height }}
    >
      <img
        className="crop-image__img"
        src={src}
        alt={alt}
        width={800}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        style={{
          objectPosition: `${ox} ${oy}`,
          transform: `scale(${z})`,
          transformOrigin: `${ox} ${oy}`,
        }}
      />
    </div>
  )
}
