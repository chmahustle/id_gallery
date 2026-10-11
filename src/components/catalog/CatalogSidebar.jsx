import { Link } from 'react-router-dom'
import { catalogPath } from '../../catalog/catalog'

export default function CatalogSidebar({
  categories,
  activeSlug,
  activeSub,
}) {
  return (
    <aside className="catalog-sidebar" aria-label="Категории каталога">
      <p className="catalog-sidebar__heading">Каталог</p>
      <ul className="catalog-sidebar__tree">
        <li>
          <Link
            to="/catalog"
            className={!activeSlug ? 'is-active' : undefined}
          >
            Все товары
          </Link>
        </li>
        {categories.map((cat) => {
          if (!cat.label?.trim() || !cat.slug) return null
          const open = activeSlug === cat.slug
          return (
            <li key={cat.slug} className={open ? 'is-open' : undefined}>
              <Link
                to={catalogPath(cat.slug)}
                className={open && !activeSub ? 'is-active' : undefined}
              >
                {cat.label}
              </Link>
              {cat.children?.length ? (
                <ul>
                  {cat.children.map((child) => (
                    <li key={child}>
                      <Link
                        to={catalogPath(cat.slug, { sub: child })}
                        className={
                          open && activeSub === child ? 'is-active' : undefined
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
    </aside>
  )
}
