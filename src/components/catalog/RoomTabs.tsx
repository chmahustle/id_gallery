import './RoomTabs.css'

type RoomTabsProps = {
  rooms: { slug: string; label: string }[]
  /** slug выбранной комнаты; пустая строка — «Все комнаты» */
  value: string
  onChange: (slug: string) => void
}

/** Строка комнат: общая для каталога и страницы «Интерьеры» */
export function RoomTabs({ rooms, value, onChange }: RoomTabsProps) {
  return (
    <div className="catalog-rooms" role="tablist" aria-label="Комнаты">
      {[{ slug: '', label: 'Все комнаты' }, ...rooms].map((room) => (
        <button
          key={room.slug || 'all'}
          type="button"
          role="tab"
          aria-selected={value === room.slug}
          className={`catalog-rooms__tab ${value === room.slug ? 'is-active' : ''}`}
          onClick={() => onChange(room.slug)}
        >
          {room.label}
        </button>
      ))}
    </div>
  )
}
