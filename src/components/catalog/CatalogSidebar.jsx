import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { catalogPath } from '../../catalog/catalog'

export default function CatalogSidebar({
  categories,
  brands,
  activeSlug,
  activeSub,
  activeBrand,
  onBrandChange,
  onNavigate,
}) {
  const [expanded, setExpanded] = useState(() =>
    activeSlug ? { [activeSlug]: true } : {},
  )

  useEffect(() => {
    if (!activeSlug) return
    setExpanded((current) =>
      current[activeSlug] ? current : { ...current, [activeSlug]: true },
    )
  }, [activeSlug])

  function toggleExpanded(slug) {
    setExpanded((current) => ({
      ...current,
      [slug]: !current[slug],
    }))
  }

  return (
    <aside className="catalog-sidebar" aria-label="Фильтры каталога">
      <section className="catalog-sidebar__section">
        <h2 className="catalog-sidebar__heading">Категории</h2>
        <ul className="catalog-sidebar__tree">
          <li>
            <Link
              to="/catalog"
              className={`catalog-sidebar__all ${!activeSlug ? 'is-active' : ''}`}
              onClick={onNavigate}
            >
              Все товары
            </Link>
          </li>
          {categories.map((cat) => {
            if (!cat.label?.trim() || !cat.slug) return null
            const isActive = activeSlug === cat.slug
            const isExpanded = Boolean(expanded[cat.slug])
            const hasChildren = Boolean(cat.children?.length)

            return (
              <li
                key={cat.slug}
                className={`${isActive ? 'is-active' : ''} ${isExpanded ? 'is-open' : ''}`}
              >
                <div className="catalog-sidebar__cat-row">
                  <Link
                    to={catalogPath(cat.slug)}
                    className={isActive && !activeSub ? 'is-active' : undefined}
                    onClick={onNavigate}
                  >
                    {cat.label}
                  </Link>
                  {hasChildren ? (
                    <button
                      type="button"
                      className="catalog-sidebar__chevron"
                      aria-label={
                        isExpanded
                          ? `Свернуть ${cat.label}`
                          : `Развернуть ${cat.label}`
                      }
                      aria-expanded={isExpanded}
                      onClick={() => toggleExpanded(cat.slug)}
                    >
                      <ChevronDown
                        size={15}
                        strokeWidth={1.4}
                        className={isExpanded ? 'is-open' : undefined}
                      />
                    </button>
                  ) : null}
                </div>
                {hasChildren ? (
                  <div
                    className={`catalog-sidebar__sub ${isExpanded ? 'is-open' : ''}`}
                  >
                    <div className="catalog-sidebar__sub-inner">
                      <ul>
                        {cat.children.map((child) => (
                          <li key={child}>
                            <Link
                              to={catalogPath(cat.slug, { sub: child })}
                              className={
                                isActive && activeSub === child
                                  ? 'is-active'
                                  : undefined
                              }
                              onClick={onNavigate}
                            >
                              {child}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </section>

      <section className="catalog-sidebar__section">
        <h2 className="catalog-sidebar__heading">Бренды</h2>
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
                onClick={() =>
                  onBrandChange(activeBrand === brand ? '' : brand)
                }
              >
                {brand}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
