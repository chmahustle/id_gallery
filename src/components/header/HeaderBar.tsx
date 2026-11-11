import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { featureFlags } from '../../data/featureFlags'
import { site as siteData } from '../../data/site'
import AppLink from '../AppLink'
import { Logo } from './Logo'

type UtilityLink = { label: string; href: string }

type HeaderBarProps = {
  menuId: string
  menuOpen: boolean
  searchOpen: boolean
  menuButtonRef: RefObject<HTMLButtonElement | null>
  searchButtonRef: RefObject<HTMLButtonElement | null>
  utilityLinks: UtilityLink[]
  userLoggedIn: boolean
  cartCount: number
  accordion: boolean
  onToggleMenu: () => void
  onOpenSearch: () => void
  onOpenCart: () => void
}

export function HeaderBar({
  menuId,
  menuOpen,
  searchOpen,
  menuButtonRef,
  searchButtonRef,
  utilityLinks,
  userLoggedIn,
  cartCount,
  accordion,
  onToggleMenu,
  onOpenSearch,
  onOpenCart,
}: HeaderBarProps) {
  return (
    <div className="header__top">
      <div className="header__left">
        <button
          ref={menuButtonRef}
          type="button"
          className="header__icon-btn"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          onClick={onToggleMenu}
        >
          {menuOpen ? (
            <X size={20} strokeWidth={1.4} aria-hidden="true" />
          ) : (
            <Menu size={20} strokeWidth={1.4} aria-hidden="true" />
          )}
        </button>
        <button
          ref={searchButtonRef}
          type="button"
          className="header__icon-btn"
          aria-label="Поиск"
          aria-expanded={searchOpen}
          onClick={onOpenSearch}
        >
          <Search size={18} strokeWidth={1.4} aria-hidden="true" />
        </button>
      </div>

      <Link
        to="/"
        className="header__logo"
        aria-label={siteData.name}
        onClick={(event) => {
          if (accordion && !menuOpen) {
            event.preventDefault()
            onToggleMenu()
          }
        }}
      >
        <span className="header__logo-stack">
          <Logo className="header__logo-svg" />
        </span>
      </Link>

      <div className="header__right">
        <div className="header__utility">
          {utilityLinks.map((item) => (
            <AppLink key={item.href} to={item.href} className="header__util">
              {item.label}
            </AppLink>
          ))}
        </div>
        {featureFlags.showAccount ? (
          <AppLink
            to="/account"
            className="header__icon-btn header__profile-btn"
            aria-label={userLoggedIn ? 'Профиль' : 'Личный кабинет'}
          >
            <User size={18} strokeWidth={1.4} aria-hidden="true" />
          </AppLink>
        ) : null}
        {featureFlags.showCommerce ? (
          <button
            type="button"
            className="header__icon-btn header__cart-btn"
            aria-label="Список выбранного"
            onClick={onOpenCart}
          >
            <ShoppingBag size={18} strokeWidth={1.4} aria-hidden="true" />
            {cartCount > 0 ? (
              <span className="header__cart-badge">{cartCount}</span>
            ) : null}
          </button>
        ) : null}
      </div>
    </div>
  )
}
