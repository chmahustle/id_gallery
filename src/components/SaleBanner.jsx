import './SaleBanner.css'

export default function SaleBanner({
  src = '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg',
  title = 'Позиции в экспозиции',
  alt = 'Интерьерная экспозиция ID Gallery',
}) {
  return (
    <section className="sale-banner" id="sale" aria-label={title}>
      <img src={src} alt={alt} className="sale-banner__img" />
      <h2 className="sr-only">{title}</h2>
    </section>
  )
}
