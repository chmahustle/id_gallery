import { brands } from './brands'
import { homeMeta } from './home'

/**
 * Для поисковиков: заголовок вкладки и описание страницы.
 * Пустые поля — страница ставит свой заголовок сама.
 */
export type SeoEntry = { title: string; description: string }

const entry = (title = '', description = ''): SeoEntry => ({ title, description })

export const seoPages: Record<string, SeoEntry> = {
  '/': entry(homeMeta.title, homeMeta.description),
  '/catalog': entry(),
  '/rooms': entry(),
  '/brands': entry(),
  ...Object.fromEntries(brands.map((brand) => [`/brands/${brand.slug}`, entry()])),
  '/interiors': entry(),
  '/services/podbor': entry(),
  '/trade': entry(),
  '/about': entry(),
  '/contact': entry(),
  '/showrooms': entry(),
  '/career': entry(),
  '/materials': entry(),
  '/request': entry(),
}

/** Запись для адреса страницы (без хвостового «/» и параметров) */
export function seoFor(pathname: string): SeoEntry | null {
  const clean = pathname.replace(/\/+$/, '') || '/'
  return seoPages[clean] || null
}
