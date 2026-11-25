import type { Category } from '../types'

/**
 * Категории — docs/content-brief.md §04
 * description / ctaLabel: общие шаблоны из брифа (этап 7c).
 */
/** Тексты страницы каталога без выбранного типа */
export const catalogCopy = {
  allTitle: 'Все товары',
  allLead: 'Весь представленный в ID Gallery ассортимент четырёх брендов.',
}

export const categories: Category[] = [
  {
    slug: 'divany',
    label: 'Диваны',
    singular: 'Диван',
    href: '/catalog/divany',
    description: 'Диваны и модульные решения различных форм и конфигураций.',
    ctaLabel: 'Смотреть модели',
    status: 'placeholder',
  },
  {
    slug: 'kresla',
    label: 'Кресла',
    singular: 'Кресло',
    href: '/catalog/kresla',
    description: 'Кресла для гостиных, спален и других интерьерных пространств.',
    ctaLabel: 'Смотреть модели',
    status: 'placeholder',
  },
  {
    slug: 'stulya',
    label: 'Стулья',
    singular: 'Стул',
    href: '/catalog/stulya',
    description: 'Стулья и модели для обеденных и рабочих зон.',
    ctaLabel: 'Смотреть модели',
    status: 'placeholder',
  },
  {
    slug: 'stoly',
    label: 'Столы',
    singular: 'Стол',
    href: '/catalog/stoly',
    description: 'Обеденные, журнальные и другие столы.',
    ctaLabel: 'Смотреть модели',
    status: 'placeholder',
  },
  {
    slug: 'hranenie',
    label: 'Мебель для хранения',
    singular: 'Мебель для хранения',
    href: '/catalog/hranenie',
    description: 'Комоды, шкафы и другие предметы для хранения.',
    ctaLabel: 'Смотреть модели',
    status: 'placeholder',
  },
  {
    slug: 'osveshchenie',
    label: 'Освещение',
    singular: 'Светильник',
    href: '/catalog/osveshchenie',
    description: 'Светильники и декоративное освещение.',
    ctaLabel: 'Смотреть модели',
    status: 'placeholder',
  },
]
