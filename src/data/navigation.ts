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
