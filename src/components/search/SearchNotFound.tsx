import { Button } from '../ui'
import './SearchNotFound.css'

/**
 * Пустой результат поиска: в панели и в каталоге.
 * «Все товары» — осознанный выход: каталог без запроса и фильтров.
 */
type SearchNotFoundProps = {
  onNavigate?: () => void
  onClear?: () => void
}

export default function SearchNotFound({ onNavigate, onClear }: SearchNotFoundProps) {
  return (
    <div className="search-empty" role="status">
      <p className="search-empty__text">
        Ничего не найдено. Попробуйте название бренда или модели.
      </p>
      <div className="search-empty__actions">
        <Button as="link" to="/catalog" variant="primary" onClick={onNavigate}>
          Все товары
        </Button>
        {onClear ? (
          <Button type="button" variant="secondary" onClick={onClear}>
            Очистить поиск
          </Button>
        ) : null}
      </div>
    </div>
  )
}
