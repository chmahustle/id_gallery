import { useEffect, useState } from 'react'
import {
  labelForBrandSlug,
  labelForModelSlug,
  labelForShowroomSlug,
} from '../../data/request-page'
import { RequestModal, type RequestContext } from './RequestModal'

/** Контекст заявки из адреса /request/?type=…&model=…&showroom=…&topic=… */
function contextFromHref(href: string): RequestContext | null {
  let url: URL
  try {
    url = new URL(href, window.location.origin)
  } catch {
    return null
  }
  const params = url.searchParams
  const topic = params.get('topic')
  if (topic === 'developers') return { kind: 'specialist', subject: '' }
  if (topic === 'podbor') return { kind: 'project', subject: '' }
  const showroom = params.get('showroom')
  if (params.get('type') === 'visit' || showroom) {
    return {
      kind: 'visit',
      subject: showroom ? labelForShowroomSlug(showroom) ?? '' : '',
    }
  }
  const model = params.get('model')
  const brand = params.get('brand')
  return {
    kind: 'offer',
    subject:
      (model ? labelForModelSlug(model) : null) ??
      (brand ? labelForBrandSlug(brand) : null) ??
      '',
  }
}

/**
 * Основное действие открывает форму поверх текущей страницы: ссылки на
 * /request/ перехватываются и открывают окно, закрытие возвращает к прежнему
 * месту. Сама страница /request/ по прямому адресу работает как раньше.
 */
export function RequestModalHost() {
  const [context, setContext] = useState<RequestContext | null>(null)

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return
      }
      const link = (event.target as Element | null)?.closest?.('a[href]')
      if (!link || link.getAttribute('target') === '_blank') return
      const href = link.getAttribute('href') || ''
      if (!/^\/request\/?(\?|$)/.test(href)) return
      const next = contextFromHref(href)
      if (!next) return
      event.preventDefault()
      event.stopPropagation()
      setContext(next)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return context ? (
    <RequestModal context={context} onClose={() => setContext(null)} />
  ) : null
}
