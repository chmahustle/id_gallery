export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="catalog-pagination" aria-label="Страницы каталога">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Назад
      </button>
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
      </ul>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Далее
      </button>
    </nav>
  )
}
