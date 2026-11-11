import AppLink from './AppLink'
import './Explore.css'

export default function Explore({
  gallery = '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
  restaurant = '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
  guesthouse = '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
  items,
}) {
  const resolved = items?.length
    ? items.map((item, index) => ({
        ...item,
        image: [gallery, restaurant, guesthouse][index] || gallery,
      }))
    : [
        { title: 'Флагманские салоны', href: '/brands', image: gallery },
        { title: 'Сервисы', href: '#membership', image: restaurant },
        { title: 'Контакты', href: '/contacts', image: guesthouse },
      ]

  return (
    <section className="explore" id="explore" aria-label="Салоны и сервисы">
      <div className="explore__stack">
        {resolved.map((item, index) => (
          <AppLink
            key={`${index}-${item.href}`}
            to={item.href}
            className="explore__panel"
          >
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              decoding="async"
            />
            <span className="sr-only">{item.title}</span>
          </AppLink>
        ))}
      </div>
    </section>
  )
}
