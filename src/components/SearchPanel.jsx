import { ArrowRight, Search, X } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { products } from '../data/products'
import { resolveBrandName } from '../lib/catalog'
import { searchBrands, searchProducts } from '../lib/search'
import SearchNotFound from './search/SearchNotFound'
import './SearchPanel.css'

const DEBOUNCE_MS = 150
const BRANDS_LIMIT = 4
const PRODUCTS_LIMIT = 6

export default function SearchPanel({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [term, setTerm] = useState('')
  const [active, setActive] = useState(-1)
  const inputRef = useRef(null)
  const panelId = useId()
  const listId = `${panelId}-list`

  /* задержка 150ms перед поиском */
  useEffect(() => {
    const id = window.setTimeout(() => setTerm(query.trim()), DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [query])

  const found = useMemo(() => {
    if (!term) return { brands: [], items: [], total: 0 }
    const all = searchProducts(products, term)
    return {
      brands: searchBrands(term).slice(0, BRANDS_LIMIT),
      items: all.slice(0, PRODUCTS_LIMIT),
      total: all.length,
    }
  }, [term])

  const rows = useMemo(
    () => [
      ...found.brands.map((brand) => ({
        id: `${panelId}-b-${brand.slug}`,
        href: `/brands/${brand.slug}`,
      })),
      ...found.items.map((item) => ({
        id: `${panelId}-p-${item.slug}`,
        href: `/product/${item.slug}`,
      })),
    ],
    [found, panelId],
  )
  const hasAny = rows.length > 0
  const empty = Boolean(term) && !hasAny

  useEffect(() => setActive(-1), [term])

  /* фокус при открытии, блокировка прокрутки страницы под панелью */
  useEffect(() => {
    if (!open) return undefined
    const t = window.setTimeout(() => inputRef.current?.focus(), 40)
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`

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
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPad
    }
  }, [open, onClose])

  function close() {
    setQuery('')
    setTerm('')
    onClose()
  }

  function goTo(href) {
    close()
    window.requestAnimationFrame(() => navigate(href))
  }

  function onInputKeyDown(event) {
    if (event.key === 'ArrowDown' && rows.length) {
      event.preventDefault()
      setActive((value) => (value + 1) % rows.length)
    } else if (event.key === 'ArrowUp' && rows.length) {
      event.preventDefault()
      setActive((value) => (value <= 0 ? rows.length - 1 : value - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      if (active >= 0 && rows[active]) goTo(rows[active].href)
      else if (term && found.total > 0) {
        goTo(`/catalog?q=${encodeURIComponent(term)}`)
      }
    }
  }

  let rowIndex = -1
  const rowProps = (id) => {
    rowIndex += 1
    return {
      id,
      role: 'option',
      'aria-selected': rowIndex === active,
      className: rowIndex === active ? 'is-active' : undefined,
    }
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
          onClick={close}
        >
          <X strokeWidth={1} size={26} />
        </button>
      </div>

      <form
        className="search-panel__form"
        role="search"
        onSubmit={(event) => event.preventDefault()}
      >
        <Search strokeWidth={1} size={22} aria-hidden="true" />
        <label className="sr-only" htmlFor={`${panelId}-input`}>
          Поиск
        </label>
        <input
          id={`${panelId}-input`}
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={hasAny}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? rows[active]?.id : undefined}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Модель, бренд или предмет"
          autoComplete="off"
          enterKeyHint="search"
        />
        {query ? (
          <button
            type="button"
            className="search-panel__clear"
            aria-label="Очистить поиск"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
          >
            <X strokeWidth={1} size={20} />
          </button>
        ) : null}
      </form>

      <div className="search-panel__body" aria-live="polite">
        {empty ? (
          <SearchNotFound query={term} onNavigate={close} />
        ) : hasAny ? (
          <div id={listId} role="listbox" aria-label="Результаты поиска">
            {found.brands.length > 0 ? (
              <section className="search-panel__group" aria-label="Бренды">
                <h2 className="search-panel__group-title">Бренды</h2>
                <ul role="group" aria-label="Бренды">
                  {found.brands.map((brand) => (
                    <li key={brand.slug} {...rowProps(`${panelId}-b-${brand.slug}`)}>
                      <Link
                        className="search-panel__row"
                        to={`/brands/${brand.slug}`}
                        tabIndex={-1}
                        onClick={close}
                      >
                        <span className="search-panel__row-title">{brand.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {found.items.length > 0 ? (
              <section className="search-panel__group" aria-label="Товары">
                <h2 className="search-panel__group-title">Товары</h2>
                <ul role="group" aria-label="Товары">
                  {found.items.map((item) => (
                    <li key={item.slug} {...rowProps(`${panelId}-p-${item.slug}`)}>
                      <Link
                        className="search-panel__row search-panel__row--product"
                        to={`/product/${item.slug}`}
                        tabIndex={-1}
                        onClick={close}
                      >
                        <span className="search-panel__thumb">
                          {item.image ? <img src={item.image} alt="" /> : null}
                        </span>
                        <span className="search-panel__row-text">
                          <span className="search-panel__row-title">
                            {`${resolveBrandName(item)} · ${item.name}`}
                          </span>
                          <span className="search-panel__row-meta">
                            {item.subcategory || item.category}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {found.total > 0 ? (
              <Link
                className="search-panel__all"
                to={`/catalog?q=${encodeURIComponent(term)}`}
                tabIndex={-1}
                onClick={close}
              >
                <span>{`Все результаты (${found.total})`}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
