import { describe, expect, it } from 'vitest'
import { extensionFor, isAllowedType, storedName } from '../uploadName.js'

describe('имена загружаемых файлов', () => {
  it('расширение — только по типу из белого списка', () => {
    expect(extensionFor('image/jpeg')).toBe('.jpg')
    expect(extensionFor('application/pdf')).toBe('.pdf')
    expect(extensionFor('text/html')).toBe('')
    expect(extensionFor(undefined)).toBe('')
  })

  it('проверяет вид файла', () => {
    expect(isAllowedType('image/png', ['image'])).toBe(true)
    expect(isAllowedType('application/pdf', ['image'])).toBe(false)
    expect(isAllowedType('application/pdf', ['image', 'pdf'])).toBe(true)
    expect(isAllowedType('video/mp4', ['image'])).toBe(false)
    expect(isAllowedType('image/x-unknown', ['image'])).toBe(false)
  })

  it('имя без опасных символов и с расширением по типу', () => {
    expect(storedName('../x y', 'image/png')).toMatch(/^xy-\d+-[a-f0-9]{12}\.png$/)
    expect(storedName('', 'image/webp')).toMatch(/^file-\d+-[a-f0-9]{12}\.webp$/)
  })
})
