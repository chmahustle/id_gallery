import { describe, expect, it } from 'vitest'
import { fieldRole } from './adminFieldRole'
import { moved } from './adminListStore'
import { slugify } from './adminSlug'

describe('адрес из названия', () => {
  it('транслитерирует русский текст', () => {
    expect(slugify('Кресло Нуар')).toBe('kreslo-nuar')
    expect(slugify('Щётка «Ёж»')).toBe('schetka-ezh')
  })

  it('ограничивает длину и убирает лишние дефисы', () => {
    expect(slugify('  --Диван--  ')).toBe('divan')
    expect(slugify('а'.repeat(80), { max: 10 })).toHaveLength(10)
  })

  it('«&» у брендов — как -and-', () => {
    expect(slugify('B&B Italia', { amp: true })).toBe('b-and-b-italia')
    expect(slugify('B&B Italia')).toBe('b-b-italia')
  })

  it('пустое значение — пустой адрес', () => {
    expect(slugify(undefined)).toBe('')
  })
})

describe('роль поля в конструкторе', () => {
  it('различает заголовок, подзаголовок, текст и фото', () => {
    expect(fieldRole({ label: 'Первый экран — заголовок', kind: 'text' }).role).toBe('title')
    expect(fieldRole({ label: 'Первый экран — подзаголовок', kind: 'text' }).role).toBe('subtitle')
    expect(fieldRole({ label: 'Первый экран — текст', kind: 'textarea' }).role).toBe('text')
    expect(fieldRole({ label: 'Первый экран — фото', kind: 'image' }).role).toBe('image')
  })

  it('место показывается, когда похожих полей несколько', () => {
    expect(fieldRole({ label: 'Этап 2 — заголовок', kind: 'text' }).place).toBe('Этап 2')
    expect(fieldRole({ label: 'Первый экран — заголовок', kind: 'text' }).place).toBe('')
  })
})

describe('перестановка в списке', () => {
  it('меняет соседей местами и не выходит за края', () => {
    expect(moved(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c'])
    expect(moved(['a', 'b'], 0, -1)).toEqual(['a', 'b'])
  })
})
