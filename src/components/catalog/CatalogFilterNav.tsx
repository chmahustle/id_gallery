import { Link } from 'react-router-dom'
import type { Category } from '../../types'

type CatalogFilterNavProps = {
  categories: Category[]
  brands: string[]
  activeSlug: string
  activeSub: string
  activeBrand: string
  href: (slug?: string, extra?: Record<string, string>) => string
  onBrandChange: (brand: string) => void
}

export function CatalogFilterCategoryNav({
  categories,
  activeSlug,
  activeSub,
  href,
}: Pick<
  CatalogFilterNavProps,
  'categories' | 'activeSlug' | 'activeSub' | 'href'
>) {
  return (
    <ul className="catalog-sidebar__tree">
      <li>
        <Link
          to={href()}
          className={`catalog-sidebar__all ${!activeSlug ? 'is-active' : ''}`}
        >
          Все товары
        </Link>
      </li>
      {categories.map((cat) => {
        if (!cat.label?.trim() || !cat.slug) return null
        const isActive = activeSlug === cat.slug
        return (
          <li key={cat.slug} className={isActive ? 'is-active' : undefined}>
            <Link
              to={href(cat.slug)}
              className={isActive && !activeSub ? 'is-active' : undefined}
            >
              {cat.label}
            </Link>
            {cat.children?.length ? (
              <ul className="catalog-filter-panel__subs">
                {cat.children.map((child) => (
                  <li key={child}>
                    <Link
                      to={href(cat.slug, { sub: child })}
                      className={
                        isActive && activeSub === child ? 'is-active' : undefined
                      }
                    >
                      {child}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function CatalogFilterBrandNav({
  brands,
  activeBrand,
  onBrandChange,
}: Pick<CatalogFilterNavProps, 'brands' | 'activeBrand' | 'onBrandChange'>) {
  return (
    <ul className="catalog-sidebar__brands">
      <li>
        <button
          type="button"
          className={`catalog-sidebar__all ${!activeBrand ? 'is-active' : ''}`}
          onClick={() => onBrandChange('')}
        >
          Все бренды
        </button>
      </li>
      {brands.map((brand) => (
        <li key={brand}>
          <button
            type="button"
            className={activeBrand === brand ? 'is-active' : undefined}
            onClick={() => onBrandChange(activeBrand === brand ? '' : brand)}
          >
            {brand}
          </button>
        </li>
      ))}
    </ul>
  )
}
