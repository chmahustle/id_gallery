import './SaleBanner.css'

export default function SaleBanner({
  src = '/images/outdoor.jpg',
  title = 'Товары в наличии и outdoor-коллекции',
  alt = 'Outdoor и товары в наличии — ID Gallery',
}) {
  return (
    <section className="sale-banner" id="sale" aria-label={title}>
      <img src={src} alt={alt} className="sale-banner__img" />
      <h2 className="sr-only">{title}</h2>
    </section>
  )
}
