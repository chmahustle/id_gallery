import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react'
import { createPortal } from 'react-dom'
import {
  FRAME_DEFAULT,
  ZOOM_MAX,
  ZOOM_MIN,
  frameStyle,
  readFrame,
  stripFrame,
  withFrame,
  type ImageFrame,
} from '../lib/imageFrame'
import { FRAMES, type FrameAspect } from './adminFrames'
import './AdminFrame.css'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const STAGE_W = 560
const STAGE_H = 420

/** Размер рамки окна: вписать пропорцию в STAGE_W × STAGE_H */
function stageSize(ratio: number) {
  return ratio >= STAGE_W / STAGE_H
    ? { width: STAGE_W, height: Math.round(STAGE_W / ratio) }
    : { width: Math.round(STAGE_H * ratio), height: STAGE_H }
}

function FramedImage({
  src,
  frame,
  ratio,
  width,
}: {
  src: string
  frame: ImageFrame
  ratio: number
  width: number
}) {
  return (
    <span className="admin-frame__box" style={{ width, aspectRatio: String(ratio) }}>
      <img src={src} alt="" draggable={false} style={frameStyle(frame)} />
    </span>
  )
}

/**
 * Окно «Кадр»: рамка в пропорциях сайта, фото двигается мышью или
 * пальцем, ползунок приближает. Справа — то же фото в других рамках.
 */
type Size = { w: number; h: number }
type Drag = { x: number; y: number; frame: ImageFrame; kx: number; ky: number }

function FrameDialog({
  src,
  aspects,
  start,
  onApply,
  onClose,
}: {
  src: string
  aspects: FrameAspect[]
  start?: ImageFrame | null
  onApply: (src: string) => void
  onClose: () => void
}) {
  const base = stripFrame(src)
  const [frame, setFrame] = useState<ImageFrame>(() => readFrame(src) || start || FRAME_DEFAULT)
  const [active, setActive] = useState(0)
  const [natural, setNatural] = useState<Size | null>(null)
  const dragRef = useRef<Drag | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const aspect = aspects[active] || aspects[0]
  const size = stageSize(aspect.ratio)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setNatural({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = base
  }, [base])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  /*
   * Сколько процентов точки кадра даёт сдвиг на 1px: снимок cover выходит
   * за рамку на overflow, а приближение вокруг точки добавляет (zoom − 1).
   */
  function perPixel(axis: 'x' | 'y') {
    if (!natural) return 0
    const box = axis === 'x' ? size.width : size.height
    const cover = Math.max(size.width / natural.w, size.height / natural.h)
    const overflow = (axis === 'x' ? natural.w : natural.h) * cover - box
    const span = frame.zoom * Math.max(0, overflow) + (frame.zoom - 1) * box
    return span > 0.5 ? 100 / span : 0
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      frame,
      kx: perPixel('x'),
      ky: perPixel('y'),
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag) return
    setFrame({
      ...drag.frame,
      x: clamp(drag.frame.x - (event.clientX - drag.x) * drag.kx, 0, 100),
      y: clamp(drag.frame.y - (event.clientY - drag.y) * drag.ky, 0, 100),
    })
  }

  function onWheel(event: ReactWheelEvent<HTMLDivElement>) {
    setFrame((prev) => ({
      ...prev,
      zoom: clamp(prev.zoom - event.deltaY * 0.002, ZOOM_MIN, ZOOM_MAX),
    }))
  }

  const zoomBy = (step: number) =>
    setFrame((prev) => ({ ...prev, zoom: clamp(prev.zoom + step, ZOOM_MIN, ZOOM_MAX) }))
  const canMove = perPixel('x') > 0 || perPixel('y') > 0

  /* где лежит всё фото целиком относительно рамки — бледно за её краями */
  let ghost: { left: number; top: number; width: number; height: number } | null = null
  if (natural) {
    const cover = Math.max(size.width / natural.w, size.height / natural.h)
    const fx = frame.x / 100
    const fy = frame.y / 100
    const dw = natural.w * cover
    const dh = natural.h * cover
    ghost = {
      left: fx * size.width + frame.zoom * ((size.width - dw) * fx - fx * size.width),
      top: fy * size.height + frame.zoom * ((size.height - dh) * fy - fy * size.height),
      width: dw * frame.zoom,
      height: dh * frame.zoom,
    }
  }

  return createPortal(
    <div className="admin-frame" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        className="admin-frame__dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Кадр фото"
        tabIndex={-1}
      >
        <header className="admin-frame__head">
          <h3>Как фото будет выглядеть на сайте</h3>
          <button
            type="button"
            className="admin-frame__close"
            aria-label="Закрыть"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="admin-frame__body">
          <div className="admin-frame__main">
            <div
              className={['admin-frame__stage', canMove ? 'is-movable' : '']
                .filter(Boolean)
                .join(' ')}
              style={{ width: size.width, height: size.height }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => (dragRef.current = null)}
              onPointerCancel={() => (dragRef.current = null)}
              onWheel={onWheel}
            >
              {/* всё фото бледно за рамкой — видно, что обрезается */}
              {ghost ? (
                <img
                  className="admin-frame__ghost"
                  src={base}
                  alt=""
                  draggable={false}
                  style={ghost}
                />
              ) : null}
              <img
                className="admin-frame__img"
                src={base}
                alt=""
                draggable={false}
                style={frameStyle(frame)}
              />
            </div>
            <p className="admin-frame__hint">
              {canMove
                ? 'Перетащите фото, чтобы выбрать, что видно в рамке. Колёсико или ползунок — приблизить.'
                : 'Фото целиком помещается в рамку. Приблизьте, чтобы выбрать часть кадра.'}
            </p>
            <div className="admin-frame__zoom">
              <button type="button" aria-label="Отдалить" onClick={() => zoomBy(-0.1)}>
                −
              </button>
              <input
                type="range"
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={0.01}
                value={frame.zoom}
                aria-label="Приближение"
                onChange={(e) => setFrame((prev) => ({ ...prev, zoom: Number(e.target.value) }))}
              />
              <button type="button" aria-label="Приблизить" onClick={() => zoomBy(0.1)}>
                +
              </button>
              <span>{`${Math.round(frame.zoom * 100)}%`}</span>
            </div>
          </div>

          {aspects.length > 1 ? (
            <ul className="admin-frame__variants" aria-label="Где показывается фото">
              {aspects.map((item, index) => (
                <li key={item.label}>
                  <button
                    type="button"
                    className={index === active ? 'is-active' : ''}
                    aria-pressed={index === active}
                    onClick={() => setActive(index)}
                  >
                    <FramedImage
                      src={base}
                      frame={frame}
                      ratio={item.ratio}
                      width={item.ratio >= 1 ? 160 : 90}
                    />
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-frame__where">{aspect.label}</p>
          )}
        </div>

        <footer className="admin-frame__foot">
          <button
            type="button"
            className="admin-field__link"
            onClick={() => setFrame(FRAME_DEFAULT)}
          >
            Сбросить кадр
          </button>
          <span>
            <button type="button" className="admin__ghost" onClick={onClose}>
              Отмена
            </button>{' '}
            <button
              type="button"
              className="admin-field__save"
              onClick={() => {
                onApply(withFrame(base, frame))
                onClose()
              }}
            >
              Применить кадр
            </button>
          </span>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

/**
 * Кнопка «Кадр» под фото в админке. aspects — рамки сайта, где стоит фото
 * (FRAMES.* или [{ label, ratio }]); onChange получает адрес с кадром.
 */
type FrameButtonProps = {
  src: string
  /** рамки сайта или функция, которая их измерит при открытии окна */
  aspects?: FrameAspect[] | (() => FrameAspect[])
  /** кадр, с которого окно начинает, если в адресе кадра нет */
  start?: ImageFrame | null | (() => ImageFrame | null)
  onChange: (src: string) => void
  disabled?: boolean
  /** короткая подпись «Кадр» — для маленьких превью */
  short?: boolean
}

export function FrameButton({
  src,
  aspects = FRAMES.card43,
  start,
  onChange,
  disabled,
  short,
}: FrameButtonProps) {
  const [open, setOpen] = useState(false)
  if (!src) return null
  const framed = Boolean(readFrame(src))
  return (
    <>
      <button
        type="button"
        className={['admin-frame-btn', framed ? 'is-framed' : ''].filter(Boolean).join(' ')}
        disabled={disabled}
        title="Показать, какая часть фото видна на сайте, и подвинуть её"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen(true)
        }}
      >
        {short ? 'Кадр' : framed ? 'Кадр настроен' : 'Кадр на сайте'}
      </button>
      {open ? (
        <FrameDialog
          src={src}
          aspects={typeof aspects === 'function' ? aspects() : aspects}
          start={typeof start === 'function' ? start() : start}
          onApply={onChange}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}
