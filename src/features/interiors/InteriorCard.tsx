import { Link } from 'react-router-dom'
import { getRoomBySlug } from '../../data/rooms'
import type { InteriorSelection } from '../../types'
import './InteriorCard.css'

/** Карточка интерьера: фото 4:5, комната (если не повторяет название) и название */
export function InteriorCard({ item }: { item: InteriorSelection }) {
  const room = item.room ? getRoomBySlug(item.room) : null
  /* подпись комнаты не нужна, если название интерьера её повторяет */
  const roomLabel = room?.label.toLowerCase()
  const showRoom =
    room && !item.title.toLowerCase().startsWith(roomLabel as string)
  const { x, y, zoom } = item.imageFocus
  return (
    <Link className="interior-card" to={`/interiors/${item.slug}`}>
      <span className="interior-card__media">
        <img
          src={item.image}
          alt=""
          loading="lazy"
          style={{
            objectPosition: `${x}% ${y}%`,
            transformOrigin: `${x}% ${y}%`,
            transform: `scale(${zoom})`,
          }}
        />
      </span>
      {showRoom && room ? (
        <span className="interior-card__room">{room.label}</span>
      ) : null}
      <span className="interior-card__title">{item.title}</span>
    </Link>
  )
}
