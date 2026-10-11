import { Search, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchSite } from '../content'
import { useBrands } from '../brands/BrandsContext'
import { useContent } from '../content/ContentContext'
import { useNews } from '../news/NewsContext'
import './SearchPanel.css'

export default function SearchPanel({ open, onClose }) {
  const { content } = useContent()
  const { items: newsItems } = useNews()
  const { items: brandItems } = useBrands()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const closeRef = useRef(null)
  const panelId = useId()
  const results = useMemo(
    () => searchSite(query, 12, content, newsItems, brandItems),
    [query, content, newsItems, brandItems],
  )

  useEffect(() => {
    if (!open) return undefined

    const t = window.setTimeout(() => inputRef.current?.focus(), 40)

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setQuery('')
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  function goTo(href) {
    setQuery('')
    onClose()
    window.requestAnimationFrame(() => {
      if (href.startsWith('/') && !href.includes('#')) {
        navigate(href)
        return
      }
      const target = href.startsWith('#') ? `/${href}` : href
      window.location.assign(target)
    })
  }

  function handleClose() {
    setQuery('')
    onClose()
  }

  return (
    <div
      id={panelId}
      className={`search-panel ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Поиск по сайту"
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      <div className="search-panel__top">
        <button
          type="button"
          className="search-panel__icon-btn"
          aria-label="Закрыть поиск"
          ref={closeRef}
          onClick={handleClose}
        >
          <X strokeWidth={1} size={26} />
        </button>
      </div>

      <form
        className="search-panel__form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          if (results[0]) goTo(results[0].href)
        }}
      >
        <Search strokeWidth={1} size={22} aria-hidden="true" />
        <label className="sr-only" htmlFor="site-search">
          Поиск
        </label>
        <input
          id="site-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск: товары, бренды, категории…"
          autoComplete="off"
          enterKeyHint="search"
        />
      </form>

      <div className="search-panel__body" aria-live="polite">
        {query.trim().length < 2 ? (
          <p className="search-panel__hint">Введите минимум 2 символа</p>
        ) : results.length === 0 ? (
          <p className="search-panel__hint">Ничего не найдено</p>
        ) : (
          <ul className="search-panel__results">
            {results.map((item) => (
              <li key={`${item.type}-${item.title}-${item.href}`}>
                <button type="button" onClick={() => goTo(item.href)}>
                  <span className="search-panel__type">{item.type}</span>
                  <span className="search-panel__title">{item.title}</span>
                  {item.meta ? (
                    <span className="search-panel__meta">{item.meta}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
