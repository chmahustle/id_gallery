import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { InteriorHotspot, Product } from '../types'
import { AdminIconButton } from './AdminIconButton'

/**
 * Точки на фото: нажатие ставит точку, точку можно перетащить,
 * у каждой — товар. Координаты в процентах от фото.
 */
type HotspotsEditorProps = {
  /** фото без метки кадра: точки ставятся на весь снимок */
  image: string
  hotspots: InteriorHotspot[]
  productIds: string[]
  productBySlug: Map<string, Product>
  onChange: (hotspots: InteriorHotspot[]) => void
}

export function HotspotsEditor({
  image,
  hotspots,
  productIds,
  productBySlug,
  onChange,
}: HotspotsEditorProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef(-1)
  const [active, setActive] = useState(-1)

  const pointAt = (event: ReactPointerEvent) => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    const round = (v: number) => Math.round(Math.min(100, Math.max(0, v)) * 10) / 10
    return {
      x: round(((event.clientX - rect.left) / rect.width) * 100),
      y: round(((event.clientY - rect.top) / rect.height) * 100),
    }
  }

  function onFramePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as Element).closest('.admin-spot')) return
    const { x, y } = pointAt(event)
    const product = productIds.find((slug) => !hotspots.some((spot) => spot.product === slug)) || ''
    onChange([...hotspots, { product, x, y }])
    setActive(hotspots.length)
  }

  function onSpotPointerDown(event: ReactPointerEvent<HTMLButtonElement>, index: number) {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = index
    setActive(index)
  }

  function onSpotPointerMove(event: ReactPointerEvent<HTMLButtonElement>) {
    const index = dragRef.current
    if (index < 0) return
    const { x, y } = pointAt(event)
    onChange(hotspots.map((spot, i) => (i === index ? { ...spot, x, y } : spot)))
  }

  const options = [...productBySlug.values()]

  return (
    <section className="admin-field admin-spots">
      <h3>Точки на фото</h3>
      <p className="admin-field__hint">
        Нажмите на фото, чтобы поставить точку; точку можно перетащить. На сайте точки видны, когда
        отмечено «Подтверждено: эти модели действительно на фото».
      </p>
      <div className="admin-spots__grid">
        <div ref={frameRef} className="admin-spots__frame" onPointerDown={onFramePointerDown}>
          <img src={image} alt="" draggable={false} />
          {hotspots.map((spot, index) => (
            <button
              key={index}
              type="button"
              className={[
                'admin-spot',
                active === index ? 'is-active' : '',
                spot.product ? '' : 'is-empty',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              title={productBySlug.get(spot.product)?.name || 'Выберите товар'}
              onPointerDown={(e) => onSpotPointerDown(e, index)}
              onPointerMove={onSpotPointerMove}
              onPointerUp={() => {
                dragRef.current = -1
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <ol className="admin-spots__list">
          {hotspots.map((spot, index) => (
            <li key={index} className={active === index ? 'is-active' : undefined}>
              <span className="admin-spots__num">{index + 1}</span>
              <select
                value={spot.product}
                aria-label={`Товар точки ${index + 1}`}
                onFocus={() => setActive(index)}
                onChange={(e) =>
                  onChange(
                    hotspots.map((s, i) => (i === index ? { ...s, product: e.target.value } : s)),
                  )
                }
              >
                <option value="">Выберите товар…</option>
                {options.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {`${item.name} · ${item.brand}`}
                  </option>
                ))}
              </select>
              <AdminIconButton
                icon="delete"
                size="sm"
                label={`Удалить точку ${index + 1}`}
                onClick={() => {
                  onChange(hotspots.filter((_, i) => i !== index))
                  setActive(-1)
                }}
              />
            </li>
          ))}
          {hotspots.length === 0 ? (
            <li className="admin-pick__empty">Точек пока нет — нажмите на фото</li>
          ) : null}
        </ol>
      </div>
    </section>
  )
}
