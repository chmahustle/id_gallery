import type { FeatureFlags, NavLink, NavSection } from '../types'
import { rooms } from './rooms'

/** Шесть колонок меню — docs/content-brief.md §01 + этап 4c */

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
  catalog: [
    { label: 'Все товары', href: '/catalog' },
    { label: 'Все комнаты', href: '/rooms/' },
    { label: 'Все бренды', href: '/brands' },
    { label: 'Интерьеры', href: '/interiors/', flag: 'showInteriors' },
  ] satisfies FooterNavLink[],
  company: [
    { label: 'О галерее', href: '/about' },
    { label: 'Шоурумы', href: '/showrooms/', flag: 'showShowrooms' },
    { label: 'Контакты', href: '/contacts' },
    { label: 'Карьера', href: '/career/', flag: 'showCareer' },
  ] satisfies FooterNavLink[],
  services: [
    { label: 'Услуги', href: '/services/podbor' },
    { label: 'Профессионалам', href: '/trade' },
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
  { label: 'Контакты', href: '/contacts' },
]

export const navigation: NavSection[] = [
  {
    title: 'Каталог',
    links: [
      { label: 'Все товары', href: '/catalog' },
      { label: 'Диваны', href: '/catalog/divany' },
      { label: 'Кресла', href: '/catalog/kresla' },
      { label: 'Стулья', href: '/catalog/stulya' },
      { label: 'Столы', href: '/catalog/stoly' },
      { label: 'Мебель для хранения', href: '/catalog/hranenie' },
      { label: 'Освещение', href: '/catalog/osveshchenie' },
    ],
    subgroups: [
      {
        title: 'По комнатам',
        links: rooms.map((room) => ({
          label: room.label,
          href: `/rooms/${room.slug}`,
        })),
      },
    ],
  },
  {
    title: 'Бренды',
    href: '/brands',
    links: [
      { label: 'Visionnaire', href: '/brands/visionnaire' },
      { label: 'Molteni&C', href: '/brands/molteni' },
      { label: 'Baxter', href: '/brands/baxter' },
      { label: 'Bonaldo', href: '/brands/bonaldo' },
      { label: 'Все бренды', href: '/brands' },
    ],
  },
  {
    title: 'Вдохновение',
    links: [
      { label: 'Интерьеры', href: '/interiors/' },
      { label: 'Подборки', href: '/#featured', flag: 'showSelections' },
    ],
  },
  {
    title: 'Услуги',
    links: [
      { label: 'Подбор и комплектация', href: '/services/podbor' },
      { label: 'Как мы работаем', href: '/services/podbor#etapy' },
      { label: 'Обсудить проект', href: '/services/podbor#obsudit' },
    ],
  },
  {
    title: 'Профессионалам',
    href: '/trade',
    links: [
      { label: 'Архитекторам и дизайнерам', href: '/trade/#designers' },
      { label: 'Девелоперам', href: '/trade/#developers' },
      { label: 'Проекты', href: '/projects/', flag: 'showProjects' },
      { label: 'Журнал', href: '/news', flag: 'showNews' },
    ],
  },
  {
    title: 'О галерее',
    links: [
      { label: 'Об ID Gallery', href: '/about' },
      { label: 'Шоурумы', href: '/showrooms/' },
    ],
  },
  {
    title: 'Контакты',
    links: [
      { label: 'Контактная информация', href: '/contacts' },
      { label: 'Обратная связь', href: '/contacts' },
    ],
  },
]
