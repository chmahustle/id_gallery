import { describe, expect, it } from 'vitest'
import { scrubContentValues, scrubUnsafe } from './safeLinks'

describe('опасные ссылки из админки', () => {
  it('убирает javascript: и data:text/html', () => {
    expect(scrubUnsafe('javascript:alert(1)')).toBe('')
    expect(scrubUnsafe('  JavaScript:alert(1)')).toBe('')
    expect(scrubUnsafe('java\tscript:alert(1)')).toBe('')
    expect(scrubUnsafe('data:text/html;base64,xxx')).toBe('')
  })

  it('обычные адреса и тексты не трогает', () => {
    for (const value of ['/catalog', 'https://example.com', 'mailto:a@b.kz', 'Текст: javascript']) {
      expect(scrubUnsafe(value)).toBe(value)
    }
  })

  it('чистит вложенные данные', () => {
    expect(
      scrubUnsafe({ links: [{ label: 'Ок', href: '/a' }, { label: 'Плохо', href: 'javascript:x' }] }),
    ).toEqual({ links: [{ label: 'Ок', href: '/a' }, { label: 'Плохо', href: '' }] })
  })

  it('чистит JSON внутри значений правок', () => {
    const result = scrubContentValues({
      'home.cta': JSON.stringify({ label: 'Кнопка', href: 'javascript:x' }),
      'home.title': 'Заголовок',
    })
    expect(JSON.parse(result['home.cta'])).toEqual({ label: 'Кнопка', href: '' })
    expect(result['home.title']).toBe('Заголовок')
  })
})
