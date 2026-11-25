import { describe, expect, it } from 'vitest'
import { frameStyle, readFrame, stripFrame, withFrame } from './imageFrame'

describe('кадр фото', () => {
  it('читает кадр из адреса', () => {
    expect(readFrame('/uploads/a.jpg#frame=30,60,1.5')).toEqual({ x: 30, y: 60, zoom: 1.5 })
  })

  it('без метки кадра нет', () => {
    expect(readFrame('/uploads/a.jpg')).toBeNull()
    expect(readFrame(undefined)).toBeNull()
  })

  it('ограничивает значения', () => {
    expect(readFrame('/a.jpg#frame=150,-5,9')).toEqual({ x: 100, y: 0, zoom: 3 })
  })

  it('записывает кадр и не дублирует метку', () => {
    const once = withFrame('/a.jpg', { x: 20, y: 40, zoom: 1.25 })
    expect(once).toBe('/a.jpg#frame=20,40,1.25')
    expect(withFrame(once, { x: 10, y: 10, zoom: 2 })).toBe('/a.jpg#frame=10,10,2')
  })

  it('кадр по центру без приближения не записывается', () => {
    expect(withFrame('/a.jpg#frame=20,40,2', { x: 50, y: 50, zoom: 1 })).toBe('/a.jpg')
    expect(withFrame('/a.jpg', null)).toBe('/a.jpg')
  })

  it('убирает метку кадра', () => {
    expect(stripFrame('/a.jpg#frame=1,2,1.5')).toBe('/a.jpg')
  })

  it('обрезает увеличенный снимок ровно по рамке', () => {
    const style = frameStyle({ x: 0, y: 100, zoom: 2 })
    expect(style.scale).toBe('2')
    /* точка в левом нижнем углу: всё лишнее срезается справа и сверху */
    expect(style.clipPath).toBe('inset(50% 50% 0% 0%)')
    expect(frameStyle({ x: 50, y: 50, zoom: 1 }).clipPath).toBe('')
  })
})
