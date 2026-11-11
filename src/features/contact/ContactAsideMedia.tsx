import { Placeholder } from '../../components/Placeholder'
import { contactAsideImage } from '../../data/contact-page'

export function ContactAsideMedia() {
  return (
    <div className="contact-page__aside-media" data-reveal-media>
      {contactAsideImage.image ? (
        <img
          className="contact-page__aside-img"
          src={contactAsideImage.image}
          alt=""
          width={contactAsideImage.width}
          height={contactAsideImage.height}
          loading="lazy"
          decoding="async"
          style={{ objectPosition: contactAsideImage.objectPosition }}
        />
      ) : (
        <Placeholder
          className="contact-page__aside-ph"
          variant="default"
          label=""
        />
      )}
    </div>
  )
}
