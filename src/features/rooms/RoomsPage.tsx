import { Link, useSearchParams } from 'react-router-dom'
import { brands } from '../../data/brands'
import { Placeholder } from '../../components/Placeholder'
import { roomsCopy } from '../../data/rooms'
import { getAvailableRooms, getRoomInteriors } from '../../lib/rooms'
import { CropImage } from '../brands/CropImage'
import './RoomsPage.css'

/**
 * /rooms/ — «По комнатам»: общий вход. Каждая комната ведёт в единый
 * каталог с выбранной комнатой (?room=), фабрика со страницы бренда сохраняется.
 */
export function RoomsPage() {
  /* ?brand= со страницы бренда: только комнаты с товарами фабрики, бренд передаётся дальше */
  const [params] = useSearchParams()
  const brand = brands.find((item) => item.slug === params.get('brand')) || null
  const brandSlug = brand?.slug || ''
  const rooms = getAvailableRooms(brandSlug)
  const roomHref = (slug: string) => {
    const query = new URLSearchParams({ room: slug })
    if (brandSlug) query.set('brand', brandSlug)
    return `/catalog?${query}`
  }

  return (
    <section className="rooms-page">
      <nav className="rooms-page__crumbs" aria-label="Хлебные крошки">
        <Link to="/catalog">Каталог</Link>
        <span aria-hidden="true">/</span>
        <span>По комнатам</span>
      </nav>
      <h1 className="rooms-page__title">{roomsCopy.title}</h1>
      <p className="rooms-page__lead">{roomsCopy.lead}</p>
      {/* ограничение по фабрике видно над списком и снимается одной ссылкой */}
      {brand ? (
        <p className="rooms-page__brand">
          <span>{`Фабрика: ${brand.name}`}</span>
          <Link className="rooms-page__all" to="/rooms/">
            Все фабрики
          </Link>
        </p>
      ) : null}
      <ul className="rooms-grid">
        {rooms.map((room) => {
          const interior = getRoomInteriors(room.slug)[0]
          return (
            <li key={room.slug}>
              <Link className="rooms-card" to={roomHref(room.slug)}>
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
                <span className="rooms-card__more">Смотреть предметы</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
