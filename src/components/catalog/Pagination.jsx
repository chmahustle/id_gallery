export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="catalog-pagination" aria-label="Страницы каталога">
      <ul>
        {pages.map((p) => (
          <li key={p}>
            <button
              type="button"
              className={p === page ? 'is-active' : undefined}
              aria-current={p === page ? 'page' : undefined}
              onClick={() => onChange(p)}
            >
              {p}
            </button>
          </li>
        ))}
        {page < totalPages ? (
          <li>
            <button
              type="button"
              className="catalog-pagination__next"
              aria-label="Следующая страница"
              onClick={() => onChange(page + 1)}
            >
              ›
            </button>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}
