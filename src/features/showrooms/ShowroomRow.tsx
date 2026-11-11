import { Link } from 'react-router-dom'
import { Button } from '../../components/ui'
import { showroomsCopy } from '../../data/showrooms'
import { useState } from 'react'
import type { ShowroomEntry } from '../../types'
import { CropImage } from '../brands/CropImage'
import { formatShowroomHeading } from '../../lib/showrooms'
import { ShowroomHeading } from './ShowroomHeading'

type ShowroomRowProps = {
  item: ShowroomEntry
  mirrored: boolean
}

/** Адрес встраиваемой карты шоурума (Яндекс.Карты); без него — шаблон */
function mapSrcFor(item: ShowroomEntry): string {
  return item.mapSrc || ''
}

export function ShowroomRow({
  item,
  mirrored,
}: ShowroomRowProps) {
  const address = item.address || showroomsCopy.addressTemplate
  const hours = item.hours || showroomsCopy.hoursTemplate
  const phone = item.phone || showroomsCopy.phoneTemplate
  const phoneHref = item.phone ? `tel:${item.phone.replace(/[^\d+]/g, '')}` : ''
  const [mapOpen, setMapOpen] = useState(false)
  const mapSrc = mapSrcFor(item)
  const visitHref = `/request/?type=visit&showroom=${encodeURIComponent(item.slug)}`

  return (
    <article
      className={[
        'showrooms-page__row',
        mirrored ? 'showrooms-page__row--mirror' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="showrooms-page__row-media" data-reveal-media>
        {mapOpen ? (
          mapSrc ? (
            <iframe
              className="showrooms-page__row-map"
              title={`${showroomsCopy.mapTitle}: ${formatShowroomHeading(item)}`}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <p className="showrooms-page__row-map-template">
              {showroomsCopy.mapTemplate}
            </p>
          )
        ) : (
          <CropImage
            src={item.image}
            focus={item.imageFocus}
            zoom={item.imageFocus.zoom}
            height={900}
            alt=""
            className="showrooms-page__row-crop"
          />
        )}
      </div>
      <div className="showrooms-page__row-copy">
        <ShowroomHeading item={item} />
        <ul className="showrooms-page__facts">
          <li>
            <button
              type="button"
              className="showrooms-page__fact-link"
              onClick={() => setMapOpen(true)}
            >
              {address}
            </button>
          </li>
          <li>{hours}</li>
          <li>
            {phoneHref ? (
              <a className="showrooms-page__fact-link" href={phoneHref}>
                {phone}
              </a>
            ) : (
              phone
            )}
          </li>
        </ul>
        <div className="showrooms-page__row-actions">
          <Button as={Link} variant="secondary" withArrow to={visitHref}>
            {showroomsCopy.visitRowCta}
          </Button>
          <button
            type="button"
            className="showrooms-page__link"
            aria-pressed={mapOpen}
            onClick={() => setMapOpen((value) => !value)}
          >
            {mapOpen ? showroomsCopy.photoCta : showroomsCopy.routeCta}
          </button>
        </div>
      </div>
    </article>
  )
}
