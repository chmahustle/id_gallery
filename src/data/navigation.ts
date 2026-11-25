import type { FeatureFlags, NavLink, NavSection } from '../types'
import { categories } from './categories'

/** Семь колонок меню в порядке владельца: О галерее → Журнал */

/** Ссылки футера — документ §19 (фильтр флагов в Footer) */
export type FooterNavLink = NavLink & {
  /** Если задан — ссылка видна только при featureFlags[flag] === true */
  flag?: keyof FeatureFlags
}

/**
 * Футер: постоянные входы во все разделы. Каждая ссылка ведёт в общий
 * раздел без фильтров; длинный список типов мебели не дублируем.
 * Проекты, журнал, авторы и подписка скрыты, пока не готовы.
 */
export const footerNav = {
  /* бренды — своей колонкой, интерьеры — в «Галерее» (утверждённый порядок) */
  catalog: [
    { label: 'Все товары', href: '/catalog' },
    { label: 'По комнатам', href: '/rooms/' },
  ] satisfies FooterNavLink[],
  company: [
    { label: 'О галерее', href: '/about' },
    { label: 'Интерьеры', href: '/interiors/', flag: 'showInteriors' },
    { label: 'Журнал', href: '/news' },
    { label: 'Шоурумы', href: '/showrooms/', flag: 'showShowrooms' },
    { label: 'Контакты', href: '/contact' },
    { label: 'Карьера', href: '/career/', flag: 'showCareer' },
  ] satisfies FooterNavLink[],
  services: [
    { label: 'Услуги', href: '/services/podbor' },
    { label: 'Для профессионалов', href: '/trade' },
    { label: 'Девелоперам', href: '/trade#developers' },
    { label: 'Каталоги и материалы', href: '/materials/', flag: 'showMaterialsLibrary' },
    { label: 'Помощь после покупки', href: '/help/', flag: 'showAftercare' },
  ] satisfies FooterNavLink[],
}

/** @deprecated используйте footerNav; оставлено для совместимости */
export const footerMenu = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Бренды', href: '/brands' },
  { label: 'О галерее', href: '/about' },
  { label: 'Контакты', href: '/contact' },
]

export const navigation: NavSection[] = [
  {
    title: 'О галерее',
    href: '/about',
    links: [
      { label: 'О галерее', href: '/about' },
      { label: 'Шоурумы', href: '/showrooms/' },
      { label: 'Карьера', href: '/career/', flag: 'showCareer' },
    ],
  },
  {
    title: 'Бренды',
    href: '/brands',
    links: [
      { label: 'Все бренды', href: '/brands' },
      { label: 'Visionnaire', href: '/brands/visionnaire' },
      { label: 'Molteni&C', href: '/brands/molteni' },
      { label: 'Baxter', href: '/brands/baxter' },
      { label: 'Bonaldo', href: '/brands/bonaldo' },
    ],
  },
  {
    title: 'Каталог',
    href: '/catalog',
    links: [
      { label: 'Все товары', href: '/catalog' },
      { label: 'По комнатам', href: '/rooms/' },
    ],
    subgroups: [
      {
        title: 'По типам',
        links: categories.map((category) => ({
          label: category.label,
          href: `/catalog/${category.slug}`,
        })),
      },
    ],
  },
  {
    title: 'Услуги',
    href: '/services/podbor',
    links: [
      { label: 'Подбор и комплектация', href: '/services/podbor' },
      { label: 'Как мы работаем', href: '/services/podbor#etapy' },
      { label: 'Обсудить проект', href: '/services/podbor#obsudit' },
    ],
  },
  {
    title: 'Интерьеры',
    href: '/interiors/',
    links: [{ label: 'Смотреть интерьеры', href: '/interiors/' }],
  },
  {
    title: 'Для профессионалов',
    href: '/trade',
    links: [
      { label: 'Дизайнерам и архитекторам', href: '/trade/#designers' },
      { label: 'Девелоперам', href: '/trade/#developers' },
      { label: 'Каталоги и материалы', href: '/materials/', flag: 'showMaterialsLibrary' },
    ],
  },
  {
    title: 'Журнал',
    href: '/news',
    links: [{ label: 'Все статьи', href: '/news' }],
  },
]

/** Верхняя строка разделов в шапке (под логотипом) */
export const topNav: FooterNavLink[] = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Бренды', href: '/brands' },
  { label: 'Интерьеры', href: '/interiors/', flag: 'showInteriors' },
  { label: 'Услуги', href: '/services/podbor' },
  { label: 'Для профессионалов', href: '/trade' },
  { label: 'О галерее', href: '/about' },
]

/** Заголовки колонок подвала; колонка «Бренды» собирается из брендов сама */
export const footerHeadings = {
  catalog: 'Каталог',
  brands: 'Бренды',
  company: 'Галерея',
  services: 'Сотрудничество',
}

type StoredLink = { label?: unknown; href?: unknown; flag?: unknown }

function cleanLinks(list: unknown): FooterNavLink[] {
  if (!Array.isArray(list)) return []
  return list
    .filter((item: StoredLink) => typeof item?.label === 'string' && typeof item?.href === 'string')
    .map((item: StoredLink) => ({
      label: String(item.label).trim(),
      href: String(item.href).trim(),
      ...(typeof item.flag === 'string' && item.flag ? { flag: item.flag as keyof FeatureFlags } : {}),
    }))
    .filter((item) => item.label && item.href)
}

/** Меню и подвал из админки (nav.top, nav.menu, nav.footer) */
export function applyTopNav(list: unknown) {
  const links = cleanLinks(list)
  if (links.length) topNav.splice(0, topNav.length, ...links)
}

export function applyMenu(list: unknown) {
  if (!Array.isArray(list)) return
  const byTitle = new Map(navigation.map((section) => [section.title, section]))
  const sections: NavSection[] = list
    .filter((item) => item && typeof item.title === 'string' && item.title.trim())
    .map((item) => ({
      title: item.title.trim(),
      ...(typeof item.href === 'string' && item.href.trim() ? { href: item.href.trim() } : {}),
      links: cleanLinks(item.links),
      /* подгруппы (список типов в «Каталоге») остаются из кода */
      ...(byTitle.get(item.keep || item.title)?.subgroups
        ? { subgroups: byTitle.get(item.keep || item.title)!.subgroups }
        : {}),
    }))
  if (sections.length) navigation.splice(0, navigation.length, ...sections)
}

export function applyFooter(value: unknown) {
  if (!value || typeof value !== 'object') return
  const data = value as Record<string, { title?: unknown; links?: unknown }>
  for (const key of ['catalog', 'company', 'services'] as const) {
    const col = data[key]
    if (!col) continue
    if (typeof col.title === 'string' && col.title.trim()) footerHeadings[key] = col.title.trim()
    const links = cleanLinks(col.links)
    footerNav[key].splice(0, footerNav[key].length, ...(links as never[]))
  }
  if (typeof data.brands?.title === 'string' && data.brands.title.trim()) {
    footerHeadings.brands = data.brands.title.trim()
  }
}
