/** Комнаты для навигации «По комнатам» (меню и фильтр каталога ?room=) */
export type Room = {
  slug: string
  label: string
  /** «Все товары для …» */
  genitive: string
  /** Категории, подходящие комнате, если у товара нет явного поля rooms */
  categorySlugs: string[]
}

export const rooms: Room[] = [
  { slug: 'gostinaya', label: 'Гостиная', genitive: 'гостиной', categorySlugs: ['divany', 'kresla', 'stoly', 'hranenie', 'osveshchenie'] },
  { slug: 'stolovaya', label: 'Столовая', genitive: 'столовой', categorySlugs: ['stulya', 'stoly', 'hranenie', 'osveshchenie'] },
  { slug: 'spalnya', label: 'Спальня', genitive: 'спальни', categorySlugs: ['kresla', 'hranenie', 'osveshchenie'] },
  { slug: 'detskaya', label: 'Детская', genitive: 'детской', categorySlugs: ['kresla', 'stulya', 'stoly', 'hranenie'] },
  { slug: 'kabinet', label: 'Кабинет', genitive: 'кабинета', categorySlugs: ['kresla', 'stulya', 'stoly', 'hranenie'] },
  { slug: 'kuhnya', label: 'Кухня', genitive: 'кухни', categorySlugs: ['stulya', 'stoly', 'osveshchenie'] },
  { slug: 'vannaya', label: 'Ванная', genitive: 'ванной', categorySlugs: ['osveshchenie', 'hranenie'] },
  { slug: 'garderobnaya', label: 'Гардеробная', genitive: 'гардеробной', categorySlugs: ['hranenie', 'osveshchenie'] },
  { slug: 'terrasa-sad', label: 'Терраса и сад', genitive: 'террасы и сада', categorySlugs: ['divany', 'kresla', 'stulya', 'stoly', 'osveshchenie'] },
]

export function getRoomBySlug(slug: string) {
  return rooms.find((room) => room.slug === slug) || null
}
