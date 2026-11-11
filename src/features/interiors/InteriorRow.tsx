import { Link } from 'react-router-dom'
import { Button } from '../../components/ui'
import { interiorsCopy } from '../../data/interiors'
import type { InteriorSelection } from '../../types'
import { CropImage } from '../brands/CropImage'

type InteriorRowProps = {
  item: InteriorSelection
  mirrored: boolean
}

export function InteriorRow({ item, mirrored }: InteriorRowProps) {
  return (
    <article
      className={[
        'interiors-page__row',
        mirrored ? 'interiors-page__row--mirror' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="interiors-page__row-media" data-reveal-media>
        <CropImage
          src={item.image}
          focus={item.imageFocus}
          zoom={item.imageFocus.zoom}
          height={900}
          alt=""
          className="interiors-page__row-crop"
        />
      </div>
      <div className="interiors-page__row-copy">
        <h3 className="interiors-page__row-title">{item.title}</h3>
        <p className="interiors-page__row-caption">{item.caption}</p>
        <Button
          as={Link}
          variant="secondary"
          withArrow
          to={`/interiors/${item.slug}/`}
        >
          {interiorsCopy.rowCta}
        </Button>
      </div>
    </article>
  )
}
