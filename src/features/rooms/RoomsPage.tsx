import { Link } from 'react-router-dom'
import { Placeholder } from '../../components/Placeholder'
import { getAvailableRooms, getRoomInteriors, getRoomProducts } from '../../lib/rooms'
import { CropImage } from '../brands/CropImage'
import './RoomsPage.css'

function modelsLabel(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} модель`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} модели`
  return `${n} моделей`
}

/** /rooms/ — обзор комнат: Все комнаты → Комната */
export function RoomsPage() {
  const rooms = getAvailableRooms()

  return (
    <section className="rooms-page">
      <nav className="rooms-page__crumbs" aria-label="Хлебные крошки">
        <Link to="/">Главная</Link>
        <span aria-hidden="true">-</span>
        <span>Все комнаты</span>
      </nav>
      <h1 className="rooms-page__title">Все комнаты</h1>
      <ul className="rooms-grid">
        {rooms.map((room) => {
          const interior = getRoomInteriors(room.slug)[0]
          return (
            <li key={room.slug}>
              <Link className="rooms-card" to={`/rooms/${room.slug}`}>
                <span className="rooms-card__media">
                  {interior?.image ? (
                    <CropImage
                      src={interior.image}
                      focus={interior.imageFocus}
                      zoom={interior.imageFocus.zoom}
                      height={420}
                      alt=""
                    />
                  ) : (
                    <Placeholder variant="light" label={room.label} />
                  )}
                </span>
                <span className="rooms-card__title">{room.label}</span>
                <span className="rooms-card__count">
                  {modelsLabel(getRoomProducts(room.slug).length)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
