import { type CSSProperties } from 'react'
import './Placeholder.css'

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")"

type PlaceholderProps = {
  className?: string
  style?: CSSProperties
  /** Показать бейдж «Заглушка» (только если DEV и showBadge) */
  showBadge?: boolean
  label?: string
  /** menu — плитка mega-menu; light — Cream Ivory для светлых секций */
  variant?: 'default' | 'menu' | 'light'
}

/**
 * Единый плейсхолдер вместо отсутствующих/неутверждённых фото.
 * Не подставлять случайные изображения.
 * Бейдж «ЗАГЛУШКА» — только DEV (в production dead-code elimination).
 */
export function Placeholder({
  className,
  style,
  showBadge = false,
  label,
  variant = 'default',
}: PlaceholderProps) {
  return (
    <div
      className={[
        'ig-placeholder',
        variant === 'menu' ? 'ig-placeholder--menu' : '',
        variant === 'light' ? 'ig-placeholder--light' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      role="img"
      aria-label={label || 'Изображение скоро появится'}
    >
      <span
        className="ig-placeholder__noise"
        style={{ backgroundImage: NOISE }}
        aria-hidden="true"
      />
      <span className="ig-placeholder__frame" aria-hidden="true" />
      <span className="ig-placeholder__mono" aria-hidden="true">
        ID
      </span>
      {import.meta.env.DEV && showBadge ? (
        <span className="ig-placeholder__badge">ЗАГЛУШКА</span>
      ) : null}
    </div>
  )
}

export default Placeholder
