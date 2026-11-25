import { brands } from '../data/brands'
import { categories } from '../data/categories'

/** Страницы сайта для подсказки в полях ссылок (список id="admin-site-pages") */
const PAGES = () => [
  ['/', 'Главная'],
  ['/catalog', 'Все товары'],
  ['/rooms/', 'По комнатам'],
  ['/brands', 'Все бренды'],
  ['/interiors/', 'Интерьеры'],
  ['/services/podbor', 'Услуги'],
  ['/services/podbor#etapy', 'Услуги: как мы работаем'],
  ['/services/podbor#obsudit', 'Услуги: обсудить проект'],
  ['/trade', 'Для профессионалов'],
  ['/trade#designers', 'Дизайнерам и архитекторам'],
  ['/trade#developers', 'Девелоперам'],
  ['/materials/', 'Каталоги и материалы'],
  ['/about', 'О галерее'],
  ['/showrooms/', 'Шоурумы'],
  ['/contact', 'Контакты'],
  ['/career/', 'Карьера'],
  ['/news', 'Журнал'],
  ['/request/?type=visit', 'Запись на консультацию'],
  ...brands.map((brand) => [`/brands/${brand.slug}`, `Бренд ${brand.name}`]),
  ...categories.map((cat) => [`/catalog/${cat.slug}`, `Тип: ${cat.label}`]),
]

export function PagesList() {
  return (
    <datalist id="admin-site-pages">
      {PAGES().map(([href, label]) => (
        <option key={href} value={href} label={label} />
      ))}
    </datalist>
  )
}

