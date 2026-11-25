import { Link } from 'react-router-dom'
import { featureFlags } from '../../data/featureFlags'
import { topNav } from '../../data/navigation'

type CategoryNavProps = {
  className?: string
}

/** Строка разделов под логотипом — список из админки («Меню и подвал») */
export function CategoryNav({ className }: CategoryNavProps) {
  return (
    <nav
      className={['header__cats', className].filter(Boolean).join(' ')}
      aria-label="Разделы сайта"
    >
      {topNav
        .filter((item) => !item.flag || featureFlags[item.flag])
        .map((item) => (
          <Link key={`${item.href}-${item.label}`} className="header__cat" to={item.href}>
            {item.label}
          </Link>
        ))}
    </nav>
  )
}
