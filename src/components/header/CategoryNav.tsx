import { Link } from 'react-router-dom'
import { featureFlags } from '../../data/featureFlags'

type CategoryNavProps = {
  className?: string
}

const SECTIONS = [
  { key: 'brands', label: 'Бренды', href: '/brands' },
  { key: 'interiors', label: 'Интерьеры', href: '/interiors/', visible: featureFlags.showInteriors },
  { key: 'services', label: 'Услуги', href: '/services/podbor' },
  { key: 'trade', label: 'Профессионалам', href: '/trade' },
  { key: 'about', label: 'О галерее', href: '/about' },
].filter((item) => item.visible !== false)

/** Строка разделов: «Каталог» ведёт на страницу всех товаров */
export function CategoryNav({ className }: CategoryNavProps) {
  return (
    <nav
      className={['header__cats', className].filter(Boolean).join(' ')}
      aria-label="Разделы сайта"
    >
      <Link className="header__cat" to="/catalog">
        Каталог
      </Link>
      {SECTIONS.map((item) => (
        <Link key={item.key} className="header__cat" to={item.href}>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
