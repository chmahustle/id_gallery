import './CollectionIntro.css'

export default function CollectionIntro({
  id,
  tone = 'dark',
  eyebrow,
  title,
  body,
  image,
  imageAlt,
  links,
}) {
  return (
    <section className={`collection collection--${tone}`} id={id}>
      <div className="collection__grid">
        <div className="collection__media">
          <img src={image} alt={imageAlt} loading="lazy" decoding="async" />
        </div>
        <div className="collection__copy">
          {eyebrow ? <p className="collection__eyebrow">{eyebrow}</p> : null}
          <h2 className="collection__title">{title}</h2>
          {body.map((paragraph, index) => (
            <p key={`${id}-body-${index}`} className="collection__body">
              {paragraph}
            </p>
          ))}
          <ul className="collection__links">
            {links.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
