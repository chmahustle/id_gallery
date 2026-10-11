import './Sourcebooks.css'

export default function Sourcebooks({
  src = '/images/sourcebooks.jpg',
  title = 'Каталоги брендов',
  alt = 'Каталоги и sourcebooks брендов ID Gallery',
}) {
  return (
    <section className="sourcebooks" id="sourcebooks" aria-label={title}>
      <img src={src} alt={alt} className="sourcebooks__img" />
      <h2 className="sr-only">{title}</h2>
    </section>
  )
}
