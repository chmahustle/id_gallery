import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import Footer from '../components/Footer'
import { FIELD_ATTR, clearFields, markFields } from '../content/markFields'
import type { PageConfig } from '../content/pageBlocks'

/* холст конструктора «Тексты и фото»: страница в масштабе, блоки, выбор полей */

/** Ширина, в которой рисуется страница; холст уменьшает её под колонку */
const PAGE_WIDTH = 1440

/** Название найденного блока: заголовок внутри или подпись секции */
/** Блок на холсте: место по вертикали (в пикселях страницы 1440px) и его поля */
export type CanvasBlock = {
  id: string
  label: string
  top: number
  height: number
  fields: string[]
  movable: boolean
}

type Drag = { id: string; startY: number; moved: boolean; movable: boolean }

function blockName(el: Element, index: number) {
  if (el.querySelector('h1')) return 'Первый экран'
  const heading = el.querySelector('h2, .section-label__text, h3')
  const text = (heading?.textContent || el.getAttribute('aria-label') || '').trim()
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : `Блок ${index + 1}`
}

/** Известные блоки страницы бренда — по их меткам */
const BRAND_BLOCKS: [string, string][] = [
  ['featured', '#brand-featured-title'],
  ['interiors', '#brand-interiors'],
  ['catalogs', '#brand-catalogs'],
  ['authors', '#brand-authors'],
  ['contacts', '#contact-info-title'],
  ['showrooms', '#showrooms-list-label'],
  ['vacancies', '#career-vacancies-title'],
]

function knownBlockId(el: Element) {
  for (const [id, selector] of BRAND_BLOCKS) {
    if (el.matches(selector) || el.querySelector(selector)) return id
  }
  return ''
}

/** Блоки страницы, нарисованной целиком: прямые дети её корня */
function detectBlocks(pageEl: Element | null): HTMLElement[] {
  let root = pageEl?.firstElementChild
  while (root && root.children.length === 1) root = root.firstElementChild
  if (!root) return []
  return [...root.children].filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.offsetHeight > 24,
  )
}

/**
 * Холст страницы: блоки с подписями, выбор блока и поля, перетаскивание.
 * Ссылки внутри холста не срабатывают.
 */
export function PageCanvas({
  config,
  version,
  selectedBlock,
  onSelectBlock,
  onSelectField,
  onBlocks,
  onReorder,
}: {
  config: PageConfig
  version: string
  selectedBlock: string
  onSelectBlock: (id: string) => void
  onSelectField: (id: string) => void
  onBlocks: (blocks: CanvasBlock[]) => void
  onReorder: (order: string[]) => void
}) {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  const [height, setHeight] = useState(0)
  const [boxes, setBoxes] = useState<CanvasBlock[]>([])
  const [dragId, setDragId] = useState('')
  const [dropIndex, setDropIndex] = useState(-1)

  const orderable = Boolean(config.blocks)
  const order = orderable && config.getOrder ? config.getOrder() : []
  const byId = useMemo(
    () => new Map((config.blocks || []).map((block) => [block.id, block])),
    [config.blocks],
  )

  /* масштаб под ширину колонки */
  useLayoutEffect(() => {
    const outer = outerRef.current
    if (!outer) return undefined
    const observer = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / PAGE_WIDTH))
    })
    observer.observe(outer)
    return () => observer.disconnect()
  }, [])

  /* блоки, поля и их места — после каждой отрисовки и при изменении высот */
  const measure = useCallback(() => {
    const inner = innerRef.current
    if (!inner) return
    /* блоки, которые на сайте проявляются при прокрутке, в холсте видны сразу */
    for (const el of inner.querySelectorAll<HTMLElement>('.cv__content *')) {
      if (getComputedStyle(el).opacity === '0') el.classList.add('is-in', 'is-ready')
    }
    setHeight(inner.scrollHeight)
    const elements: Element[] = orderable
      ? [...inner.querySelectorAll('[data-cv-block]')]
      : [
          ...detectBlocks(inner.querySelector('[data-cv-page]')),
          ...inner.querySelectorAll('[data-cv-block="footer"]'),
        ]
    /* поля ищутся внутри своего блока: одинаковые тексты и фото соседей не путаются */
    if (orderable) {
      clearFields(inner)
      for (const el of elements) {
        const blockId = el.getAttribute('data-cv-block')
        if (blockId && blockId !== 'footer') markFields(el, config.group, blockId)
      }
    } else {
      markFields(inner, config.group)
    }
    const top = inner.getBoundingClientRect().top
    const s = inner.getBoundingClientRect().width / PAGE_WIDTH || 1
    const next = elements.map((el, index): CanvasBlock => {
      const rect = el.getBoundingClientRect()
      const id = el.getAttribute('data-cv-block') || knownBlockId(el) || `b${index}`
      const label =
        id === 'footer'
          ? 'Подвал'
          : orderable
            ? id === 'hero'
              ? config.top?.label
              : byId.get(id)?.label
            : blockName(el, index)
      const fields = [
        ...new Set(
          [...el.querySelectorAll(`[${FIELD_ATTR}]`)].map((f) => f.getAttribute(FIELD_ATTR) || ''),
        ),
      ]
      return {
        id,
        label: label || `Блок ${index + 1}`,
        top: (rect.top - top) / s,
        height: rect.height / s,
        fields,
        movable: orderable && id !== 'hero' && id !== 'footer',
      }
    })
    setBoxes(next)
    onBlocks(next)
  }, [orderable, config, byId, onBlocks])

  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return undefined
    let timer = 0
    const run = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(measure, 120)
    }
    run()
    const ro = new ResizeObserver(run)
    ro.observe(inner)
    const mo = new MutationObserver(run)
    mo.observe(inner, { childList: true, subtree: true })
    return () => {
      window.clearTimeout(timer)
      ro.disconnect()
      mo.disconnect()
    }
  }, [measure, version, config])

  /* клик по холсту: поле → поле, иначе блок под курсором */
  function onClick(event: ReactMouseEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    /* после захвата указателя click приходит на холст — берём элемент под курсором */
    const hit = document.elementFromPoint(event.clientX, event.clientY) || (event.target as Element)
    const fieldEl = hit.closest?.(`[${FIELD_ATTR}]`)
    const inner = innerRef.current
    if (!inner) return
    const s = scale || 1
    const y = (event.clientY - inner.getBoundingClientRect().top) / s
    const box = boxes.find((b) => y >= b.top && y < b.top + b.height)
    if (box) onSelectBlock(box.id)
    if (fieldEl) onSelectField(fieldEl.getAttribute(FIELD_ATTR) || '')
  }

  /* перетаскивание: мышью или пальцем, место вставки — по середине блоков */
  const dragRef = useRef<Drag | null>(null)
  const suppressClickRef = useRef(false)

  function indexAt(clientY: number) {
    const inner = innerRef.current
    if (!inner) return -1
    const y = (clientY - inner.getBoundingClientRect().top) / (scale || 1)
    const movable = boxes.filter((b) => b.movable)
    const index = movable.findIndex((b) => y < b.top + b.height / 2)
    return index === -1 ? movable.length : index
  }

  /* у краёв области страница прокручивается сама */
  function autoScroll(clientY: number) {
    const stage = outerRef.current?.closest('.admin-visual__stage')
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    if (clientY < rect.top + 60) stage.scrollTop -= 24
    else if (clientY > rect.bottom - 60) stage.scrollTop += 24
  }

  function boxAt(clientY: number) {
    const inner = innerRef.current
    if (!inner) return null
    const y = (clientY - inner.getBoundingClientRect().top) / (scale || 1)
    return boxes.find((b) => y >= b.top && y < b.top + b.height) || null
  }

  /* блок тянется за любое место; короткое нажатие без движения — обычный выбор */
  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    const box = boxAt(event.clientY)
    if (!box) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: box.id, startY: event.clientY, moved: false, movable: box.movable }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || !drag.movable) return
    if (!drag.moved && Math.abs(event.clientY - drag.startY) < 8) return
    if (!drag.moved) {
      drag.moved = true
      setDragId(drag.id)
      onSelectBlock(drag.id)
    }
    autoScroll(event.clientY)
    setDropIndex(indexAt(event.clientY))
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag || !drag.moved) return
    /* после перетаскивания браузер пришлёт click — он не должен выбирать поле */
    suppressClickRef.current = true
    const index = indexAt(event.clientY)
    setDragId('')
    setDropIndex(-1)
    const current = [...order]
    const from = current.indexOf(drag.id)
    if (from < 0) return
    current.splice(from, 1)
    current.splice(index > from ? index - 1 : index, 0, drag.id)
    if (current.join() !== order.join()) onReorder(current)
  }

  function onPointerCancel() {
    dragRef.current = null
    setDragId('')
    setDropIndex(-1)
  }

  const movableBoxes = boxes.filter((b) => b.movable)
  const dropTop =
    dropIndex < 0
      ? null
      : dropIndex < movableBoxes.length
        ? movableBoxes[dropIndex].top
        : movableBoxes.length
          ? movableBoxes[movableBoxes.length - 1].top + movableBoxes[movableBoxes.length - 1].height
          : null

  return (
    <div ref={outerRef} className="cv" style={{ '--cv-inv': 1 / (scale || 1) } as CSSProperties}>
      <div className="cv__sizer" style={{ height: height * scale }}>
        <div
          ref={innerRef}
          className="cv__page"
          style={{ width: PAGE_WIDTH, transform: `scale(${scale})` }}
          onClickCapture={onClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onDragStart={(e) => e.preventDefault()}
        >
          <div key={version} className="cv__content">
            {orderable ? (
              <article className={['cv__article', config.wrapperClass].filter(Boolean).join(' ')}>
                {config.top ? <div data-cv-block="hero">{config.top.render()}</div> : null}
                {order.map((id) => (
                  <div key={id} data-cv-block={id}>
                    {byId.get(id)?.render()}
                  </div>
                ))}
              </article>
            ) : (
              <div data-cv-page>{config.render?.()}</div>
            )}
            {/* подвал сайта — всегда внизу, не переставляется */}
            <div data-cv-block="footer">
              <Footer />
            </div>
          </div>

          {/* рамки и подписи блоков */}
          <div className="cv__layer" aria-hidden="true">
            {boxes.map((box) => (
              <div
                key={box.id}
                className={[
                  'cv__box',
                  selectedBlock === box.id ? 'is-selected' : '',
                  dragId === box.id ? 'is-dragging' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ top: box.top, height: box.height }}
              >
                <div
                  className={['cv__tag', box.movable ? 'is-movable' : ''].filter(Boolean).join(' ')}
                  title={
                    box.movable
                      ? 'Нажмите, чтобы открыть; тяните блок, чтобы переставить'
                      : 'Нажмите, чтобы открыть'
                  }
                >
                  {box.movable ? <span className="cv__grip">⠿</span> : null}
                  {box.label}
                  {box.fields.length ? <em>{box.fields.length}</em> : null}
                </div>
              </div>
            ))}
            {dropTop !== null ? <div className="cv__drop" style={{ top: dropTop }} /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
