import { ArrowRight } from 'lucide-react'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ProductCard } from '../../components/catalog/ProductCard'
import { SectionLabel, SliderArrows } from '../../components/ui'
import type { Product } from '../../types'

const MOVE_MS = 650
/* мягкое замедление в конце (токен --ease проекта) */
const MOVE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

type BrandFeaturedProps = {
  brandName: string
  catalogHref: string
  items: Product[]
}

type Move = {
  dir: 1 | -1
  rects: Map<string, DOMRect>
  container: DOMRect
  leaving: Product
  leavingRect: DOMRect
}

type Ghost = {
  item: Product
  left: number
  top: number
  width: number
  height: number
  dir: 1 | -1
}

const mediaOf = (el: HTMLElement) =>
  el.querySelector<HTMLElement>('.product-grid__media')

const captionsOf = (el: HTMLElement) =>
  Array.from(el.querySelectorAll<HTMLElement>('article > :not(.product-grid__media)'))

/**
 * Три слота разной ширины (41 / 24 / 32%) с фото 4:3. При смене фото
 * плавно переезжают и масштабируются в соседний слот (FLIP по transform);
 * подписи карточек проявляются на новом месте.
 */
export function BrandFeatured({ brandName, catalogHref, items }: BrandFeaturedProps) {
  const [start, setStart] = useState(0)
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const n = items.length
  const slider = n > 3
  const visible = Array.from({ length: Math.min(3, n) }, (_, i) => items[(start + i) % n]!)

  const boxRef = useRef<HTMLDivElement>(null)
  const nodes = useRef(new Map<string, HTMLLIElement>())
  const move = useRef<Move | null>(null)
  const busy = useRef(false)
  const timers = useRef<number[]>([])

  const go = (dir: 1 | -1) => {
    if (busy.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduce && boxRef.current) {
      const rects = new Map<string, DOMRect>()
      nodes.current.forEach((el, slug) => {
        const media = mediaOf(el)
        if (media) rects.set(slug, media.getBoundingClientRect())
      })
      const leaving = dir > 0 ? visible[0]! : visible[2]!
      move.current = {
        dir,
        rects,
        container: boxRef.current.getBoundingClientRect(),
        leaving,
        leavingRect: rects.get(leaving.slug)!,
      }
      busy.current = true
    }
    setStart((value) => (value + dir + n) % n)
  }

  useLayoutEffect(() => {
    const current = move.current
    if (!current) return
    move.current = null

    nodes.current.forEach((el, slug) => {
      const media = mediaOf(el)
      if (!media) return
      const from = current.rects.get(slug)
      const to = media.getBoundingClientRect()
      const captions = captionsOf(el)
      const fade = `opacity ${Math.round(MOVE_MS * 0.5)}ms ease ${Math.round(MOVE_MS * 0.45)}ms`

      media.style.transition = 'none'
      media.style.transformOrigin = '0 0'
      media.style.willChange = 'transform, opacity'
      if (from) {
        const scale = from.width / to.width
        media.style.transform = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${scale})`
      } else {
        media.style.opacity = '0'
        media.style.transform = `translateX(${current.dir * 14}%)`
      }
      captions.forEach((node) => {
        node.style.transition = 'none'
        node.style.opacity = '0'
      })

      void media.getBoundingClientRect()
      media.style.transition = `transform ${MOVE_MS}ms ${MOVE_EASE}, opacity ${Math.round(MOVE_MS * 0.7)}ms ease-out`
      media.style.transform = ''
      media.style.opacity = ''
      captions.forEach((node) => {
        node.style.transition = fade
        node.style.opacity = ''
      })
    })

    setGhost({
      item: current.leaving,
      left: current.leavingRect.left - current.container.left,
      top: current.leavingRect.top - current.container.top,
      width: current.leavingRect.width,
      height: current.leavingRect.height,
      dir: current.dir,
    })
    timers.current.push(
      window.setTimeout(() => {
        nodes.current.forEach((el) => {
          const media = mediaOf(el)
          if (media) {
            media.style.transition = ''
            media.style.willChange = ''
            media.style.transformOrigin = ''
          }
          captionsOf(el).forEach((node) => {
            node.style.transition = ''
          })
        })
        setGhost(null)
        busy.current = false
      }, MOVE_MS),
    )
  }, [start])

  useLayoutEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id))
    },
    [],
  )

  return (
    <section
      className="brand-page__showcase"
      aria-labelledby="brand-featured-title"
    >
      <div className="brand-page__showcase-head">
        <SectionLabel id="brand-featured-title">Подборка товаров</SectionLabel>
        <div className="brand-page__showcase-tools">
          <Link className="brand-page__section-link" to={catalogHref}>
            <span>{`Все товары ${brandName}`}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          {slider ? (
            <SliderArrows
              className="brand-page__arrows"
              prevLabel="Предыдущие товары"
              nextLabel="Следующие товары"
              onPrev={() => go(-1)}
              onNext={() => go(1)}
            />
          ) : null}
        </div>
      </div>

      <div className="brand-page__stagger" ref={boxRef}>
        <ul className="brand-page__steps">
          {visible.map((item) => (
            <li
              key={item.slug}
              className="brand-page__step"
              ref={(el) => {
                if (el) nodes.current.set(item.slug, el)
                else nodes.current.delete(item.slug)
              }}
            >
              <ProductCard item={item} hideBrand />
            </li>
          ))}
        </ul>
        {ghost ? (
          <div
            className="brand-page__ghost"
            aria-hidden="true"
            style={
              {
                left: ghost.left,
                top: ghost.top,
                width: ghost.width,
                height: ghost.height,
                ['--ghost-dx' as string]: `${ghost.dir * -14}%`,
                ['--ghost-ms' as string]: `${MOVE_MS}ms`,
              } as CSSProperties
            }
          >
            <img src={ghost.item.image} alt="" />
          </div>
        ) : null}
      </div>

      <ul className="brand-page__scroller">
        {items.map((item) => (
          <li key={item.slug}>
            <ProductCard item={item} hideBrand />
          </li>
        ))}
      </ul>
    </section>
  )
}
