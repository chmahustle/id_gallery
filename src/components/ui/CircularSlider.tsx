import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import './CircularSlider.css'

const MOVE_MS = 450

/** Состояние кругового слайдера: сдвиг на одну карточку, плавно, без автопрокрутки */
export function useCircularSlider(count: number) {
  const [start, setStart] = useState(0)
  /* положение ленты в карточках: -1 — покой, -2 — вперёд, 0 — назад */
  const [shift, setShift] = useState(-1)
  const [animating, setAnimating] = useState(false)
  const busy = useRef(false)

  const go = (dir: 1 | -1) => {
    if (busy.current || count < 2) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setStart((value) => (value + dir + count) % count)
      return
    }
    busy.current = true
    setAnimating(true)
    setShift(dir > 0 ? -2 : 0)
    window.setTimeout(() => {
      setAnimating(false)
      setStart((value) => (value + dir + count) % count)
      setShift(-1)
      busy.current = false
    }, MOVE_MS)
  }

  return { start, shift, animating, go }
}

type CircularSliderProps<T> = {
  items: T[]
  renderItem: (item: T) => ReactNode
  slider: ReturnType<typeof useCircularSlider>
  /** Видимых карточек на десктопе */
  cols?: number
  /** Видимых карточек на планшете (по умолчанию на одну меньше) */
  tabletCols?: number
  /** Ширина карточки в мобильной ленте со свайпом, % */
  mobileWidth?: number
  className?: string
}

/**
 * Общий слайдер: на десктопе и планшете круговая лента (ширина карточек
 * одинаковая, зазор как в сетке каталога), на мобильном свайп (scroll-snap).
 * Если карточек не больше видимых, сдвига нет.
 */
export function CircularSlider<T>({
  items,
  renderItem,
  slider,
  cols = 3,
  tabletCols = cols - 1,
  mobileWidth = 78,
  className,
}: CircularSliderProps<T>) {
  const n = items.length
  const active = n > cols
  const windowSize = cols + 2
  const { start, shift, animating } = slider

  const list = active
    ? Array.from({ length: windowSize }, (_, k) => {
        const index = (start - 1 + k + n * 2) % n
        return { item: items[index]!, key: n >= windowSize ? index : `${index}-${k}` }
      })
    : items.map((item, index) => ({ item, key: index }))

  return (
    <div
      className={['circ', className].filter(Boolean).join(' ')}
      style={
        {
          ['--circ-cols' as string]: cols,
          ['--circ-cols-tablet' as string]: tabletCols,
          ['--circ-mobile' as string]: `${mobileWidth}%`,
        } as CSSProperties
      }
    >
      <div className="circ__viewport">
        <ul
          className={[
            'circ__track',
            active ? 'is-active' : '',
            animating ? 'is-animating' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={active ? ({ ['--shift' as string]: shift } as CSSProperties) : undefined}
        >
          {list.map(({ item, key }) => (
            <li key={key} className="circ__item">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      </div>
      <ul className="circ__scroller">
        {items.map((item, index) => (
          <li key={index} className="circ__item">
            {renderItem(item)}
          </li>
        ))}
      </ul>
    </div>
  )
}
