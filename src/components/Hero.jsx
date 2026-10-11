import './Hero.css'

export default function Hero({
  src = '/images/hero.jpg',
  title = 'ID Gallery — интерьерный центр класса люкс',
  alt = 'Интерьер гостиной — новые коллекции ID Gallery',
}) {
  return (
    <section className="hero" id="top" aria-label={title}>
      <img src={src} alt={alt} className="hero__img" />
      <h1 className="sr-only">{title}</h1>
    </section>
  )
}
