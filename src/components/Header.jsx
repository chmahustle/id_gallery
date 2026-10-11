import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { catalogPath } from '../catalog/catalog'
import { useContent } from '../content/ContentContext'
import AppLink from './AppLink'
import CartPanel from './CartPanel'
import SearchPanel from './SearchPanel'
import './Header.css'

export default function Header({ variant = 'overlay' }) {
  const { content } = useContent()
  const { site, header, mainNav, catalogCategories } = content
  const { openCart, count: cartCount } = useCart()
  const solid = variant === 'solid'
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openCat, setOpenCat] = useState(null)
  const menuButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const searchButtonRef = useRef(null)
  const catsRef = useRef(null)
  const menuId = useId()
  const panelId = useId()

  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen, searchOpen])

  useEffect(() => {
    if (!menuOpen) return undefined

    const previouslyFocused = document.activeElement
    const menuButton = menuButtonRef.current
    closeButtonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus()
      } else {
        menuButton?.focus()
      }
    }
  }, [menuOpen])

  useEffect(() => {
    if (openCat == null) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpenCat(null)
    }
    const onPointerDown = (event) => {
      if (!catsRef.current?.contains(event.target)) setOpenCat(null)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [openCat])

  const activeCategory =
    openCat === null ? null : catalogCategories[openCat] || null

  return (
    <>
      <header
        className={`header ${solid ? 'header--solid' : ''} ${
          openCat !== null ? 'header--panel-open' : ''
        }`}
      >
        <div className="header__top">
          <div className="header__left">
            <button
              type="button"
              className="header__icon-btn"
              aria-label="Открыть меню"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              ref={menuButtonRef}
              onClick={() => {
                setSearchOpen(false)
                setOpenCat(null)
                setMenuOpen(true)
              }}
            >
              <Menu strokeWidth={1} size={22} />
            </button>
            <button
              type="button"
              className="header__icon-btn"
              aria-label="Открыть поиск"
              aria-expanded={searchOpen}
              ref={searchButtonRef}
              onClick={() => {
                setMenuOpen(false)
                setOpenCat(null)
                setSearchOpen(true)
              }}
            >
              <Search strokeWidth={1} size={20} />
            </button>
          </div>

          <Link to="/" className="header__logo" aria-label={`${site.name} — главная`}>
            <span className="header__logo-stack">
              <img
                className="header__logo-img header__logo-img--light"
                src="/brand/logo-full-light.webp"
                alt=""
                width={220}
                height={21}
                decoding="async"
              />
              <img
                className="header__logo-img header__logo-img--dark"
                src="/brand/logo-full-dark.webp"
                alt=""
                width={220}
                height={21}
                decoding="async"
              />
            </span>
          </Link>

          <div className="header__right">
            <nav className="header__utility" aria-label="Сервисы">
              <AppLink to="/partners">{header.partners}</AppLink>
              <AppLink to="/contacts">{header.contacts}</AppLink>
            </nav>
            <button
              type="button"
              className="header__icon-btn header__cart-btn"
              aria-label={
                cartCount > 0
                  ? `Открыть корзину, товаров: ${cartCount}`
                  : 'Открыть корзину'
              }
              onClick={() => {
                setMenuOpen(false)
                setSearchOpen(false)
                setOpenCat(null)
                openCart()
              }}
            >
              <ShoppingBag strokeWidth={1} size={20} />
              {cartCount > 0 ? (
                <span className="header__cart-badge">{cartCount}</span>
              ) : null}
            </button>
          </div>
        </div>

        <div className="header__cats-wrap" ref={catsRef}>
          <nav className="header__cats" aria-label="Каталог">
            {catalogCategories.map((item, index) => {
              if (!item.label?.trim()) return null
              const isOpen = openCat === index
              return (
                <button
                  key={item.href || index}
                  type="button"
                  className={`header__cat ${isOpen ? 'is-open' : ''}`}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() =>
                    setOpenCat((current) => (current === index ? null : index))
                  }
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div
            id={panelId}
            className={`cat-panel ${activeCategory ? 'is-open' : ''}`}
            role="region"
            aria-label={
              activeCategory
                ? `Подкатегории: ${activeCategory.label}`
                : 'Подкатегории каталога'
            }
            hidden={!activeCategory}
          >
            {activeCategory ? (
              <div className="cat-panel__inner">
                <div className="cat-panel__col">
                  <p className="cat-panel__heading">Подкатегории</p>
                  {activeCategory.children?.length ? (
                    <ul>
                      {activeCategory.children.map((child, childIndex) => (
                        <li key={`${childIndex}-${child}`}>
                          <Link
                            to={catalogPath(activeCategory.slug, { sub: child })}
                            onClick={() => setOpenCat(null)}
                          >
                            {child}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="cat-panel__empty">Нет подкатегорий</p>
                  )}
                </div>

                {activeCategory.brands?.length ? (
                  <div className="cat-panel__col">
                    <p className="cat-panel__heading">Бренды</p>
                    <ul>
                      {activeCategory.brands.map((brand, brandIndex) => (
                        <li key={`${brandIndex}-${brand}`}>
                          <Link
                            to={catalogPath(activeCategory.slug, { brand })}
                            onClick={() => setOpenCat(null)}
                          >
                            {brand}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="cat-panel__col cat-panel__col--cta">
                  <Link
                    className="cat-panel__all"
                    to={catalogPath(activeCategory.slug)}
                    onClick={() => setOpenCat(null)}
                  >
                    Смотреть всё · {activeCategory.label}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <div
        id={menuId}
        className={`menu ${menuOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Меню сайта"
        aria-hidden={!menuOpen}
        inert={!menuOpen ? true : undefined}
      >
        <div className="menu__top">
          <button
            type="button"
            className="header__icon-btn menu__close"
            aria-label="Закрыть меню"
            ref={closeButtonRef}
            onClick={() => setMenuOpen(false)}
          >
            <X strokeWidth={1} size={26} />
          </button>
        </div>
        <nav className="menu__nav" aria-label="Основные разделы">
          {mainNav.map((item, index) =>
            item.label?.trim() ? (
              <AppLink
                key={`${index}-${item.href}`}
                to={
                  item.href?.startsWith('#') && solid
                    ? `/${item.href}`
                    : item.href
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </AppLink>
            ) : null,
          )}
        </nav>
      </div>

      <SearchPanel
        open={searchOpen}
        onClose={() => {
          setSearchOpen(false)
          searchButtonRef.current?.focus()
        }}
      />

      <CartPanel />
    </>
  )
}
