import { Link } from 'react-router-dom'
import './Membership.css'

export default function Membership({
  src = '/images/membership.jpg',
  title = 'Партнёрам ID Gallery',
  alt = 'Партнёрам — архитекторы, дизайнеры, девелоперы',
}) {
  return (
    <section className="membership" id="membership" aria-label={title}>
      <Link to="/partners" className="membership__link" aria-label={`${title} — подробнее`}>
        <img src={src} alt={alt} className="membership__img" />
      </Link>
      <h2 className="sr-only">{title}</h2>
    </section>
  )
}
