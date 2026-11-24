import { ArrowRight, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { productPath } from '../../catalog/catalog'
import { interiorsCopy } from '../../data/interiors'
import { resolveBrandName } from '../../lib/catalog'
import type { InteriorHotspot, Product } from '../../types'
import './InteriorScene.css'

type InteriorSceneProps = {
  image: string
  hotspots: InteriorHotspot[]
  /** Товары подборки: точка без товара не рисуется */
  products: Product[]
  /** Процент кадра, скрытый сверху (вшитые надписи) */
  cropTop?: number
  title: string
}

type Size = { w: number; h: number }

function SceneCardBody({ product }: { product: Product }) {
  return (
    <>
      <span className="interior-scene__thumb">
        {product.image ? <img src={product.image} alt="" /> : null}
      </span>
      <span className="interior-scene__info">
        <span className="interior-scene__brand">{resolveBrandName(product)}</span>
        <span className="interior-scene__name">{product.name}</span>
        <span className="interior-scene__type">
          {product.subcategory || product.category}
        </span>
        <span className="interior-scene__more">
          {interiorsCopy.detailProductCta}
          <ArrowRight size={14} aria-hidden="true" />
        </span>
      </span>
    </>
  )
}

/**
 * Фото интерьера целиком с точками на предметах. Наведение или фокус на точке
 * показывает карточку модели; на устройствах без наведения — по нажатию.
 */
export function InteriorScene({
  image,
  hotspots,
  products,
  cropTop = 0,
  title,
}: InteriorSceneProps) {
  const [size, setSize] = useState<Size | null>(null)
  const [frame, setFrame] = useState<Size | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)

  function openSpot(slug: string) {
    window.clearTimeout(closeTimer.current)
    setActive(slug)
  }

  /* закрытие с задержкой: курсор успевает перейти с точки на карточку */
  function scheduleClose(slug: string) {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => {
      setActive((current) => (current === slug ? null : current))
    }, 250)
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  /* размер кадра на экране — для пересчёта точек при обрезке */
  useEffect(() => {
    const el = frameRef.current
    if (!el) return undefined
    const sync = () => setFrame({ w: el.clientWidth, h: el.clientHeight })
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  const top = Math.min(Math.max(cropTop, 0), 60)

  const bySlug = new Map(products.map((item) => [item.slug, item]))
  const points = hotspots.filter((spot) => bySlug.has(spot.product))

  /* клик вне сцены и Escape закрывают карточку */
  useEffect(() => {
    if (!active) return undefined
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setActive(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [active])

  if (points.length === 0) return null

  const activeProduct = active ? bySlug.get(active) || null : null

  /*
   * Фото на всю ширину: заполняет кадр с обрезкой (как cover), без верхней
   * полосы cropTop. Кадр центрируется по точкам, чтобы предметы были в кадре.
   */
  const layout =
    size && frame && frame.w > 0 && frame.h > 0
      ? (() => {
          const visibleH = size.h * (1 - top / 100)
          const scale = Math.max(frame.w / size.w, frame.h / visibleH)
          const dw = size.w * scale
          const dh = size.h * scale
          const mean = (values: number[]) =>
            values.reduce((sum, value) => sum + value, 0) / values.length
          const cx = (mean(points.map((spot) => spot.x)) / 100) * dw
          const cy = (mean(points.map((spot) => spot.y)) / 100) * dh
          const clamp = (value: number, min: number, max: number) =>
            Math.min(max, Math.max(min, value))
          const left = clamp(frame.w / 2 - cx, frame.w - dw, 0)
          const topPx = clamp(
            frame.h / 2 - cy,
            frame.h - dh,
            -dh * (top / 100),
          )
          return { dw, dh, left, top: topPx }
        })()
      : null

  return (
    <div className="interior-scene" ref={rootRef}>
      <div className="interior-scene__frame" ref={frameRef}>
        {/* обрезка только у фото — карточки у точек не обрезаются */}
        <div className="interior-scene__crop">
          <img
            className="interior-scene__img"
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            style={
              layout
                ? {
                    width: layout.dw,
                    height: layout.dh,
                    left: layout.left,
                    top: layout.top,
                  }
                : { visibility: 'hidden' }
            }
            onLoad={(event) => {
              const img = event.currentTarget
              setSize({ w: img.naturalWidth, h: img.naturalHeight })
            }}
          />
        </div>

        {layout && frame
          ? points.map((spot) => {
              const product = bySlug.get(spot.product)!
              const px = layout.left + (layout.dw * spot.x) / 100
              const py = layout.top + (layout.dh * spot.y) / 100
              /* точка за краем кадра не рисуется */
              if (px < 16 || px > frame.w - 16 || py < 16 || py > frame.h - 16) {
                return null
              }
              const x = (px / frame.w) * 100
              const y = (py / frame.h) * 100
              const open = active === spot.product
              const brand = resolveBrandName(product)
              return (
                <div
                  key={spot.product}
                  className={[
                    'interior-scene__spot',
                    open ? 'is-open' : '',
                    x > 60 ? 'is-left' : '',
                    y > 60 ? 'is-up' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  /* наведение — только мышь; на касание отвечает нажатие */
                  onPointerEnter={(event) => {
                    if (event.pointerType === 'mouse') openSpot(spot.product)
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === 'mouse') scheduleClose(spot.product)
                  }}
                >
                  <button
                    type="button"
                    className="interior-scene__dot"
                    aria-expanded={open}
                    aria-label={`${brand} · ${product.name}`}
                    onClick={() =>
                      setActive((current) =>
                        current === spot.product ? null : spot.product,
                      )
                    }
                    onFocus={() => openSpot(spot.product)}
                  >
                    <Plus size={14} strokeWidth={1.4} aria-hidden="true" />
                  </button>

                  <Link
                    className="interior-scene__card"
                    to={productPath(product.slug)}
                    tabIndex={open ? 0 : -1}
                    aria-hidden={!open}
                  >
                    <SceneCardBody product={product} />
                  </Link>
                </div>
              )
            })
          : null}
      </div>

      {/* телефон: карточка выбранной модели — под фото */}
      {activeProduct ? (
        <Link
          className="interior-scene__card interior-scene__card--below"
          to={productPath(activeProduct.slug)}
        >
          <SceneCardBody product={activeProduct} />
        </Link>
      ) : null}

    </div>
  )
}
