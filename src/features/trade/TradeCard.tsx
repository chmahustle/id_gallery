import { Link } from 'react-router-dom'
import { Button } from '../../components/ui'
import type { TradeCard as TradeCardData } from '../../data/trade'
import { CropImage } from '../brands/CropImage'

type TradeCardProps = {
  card: TradeCardData
}

export function TradeCard({ card }: TradeCardProps) {
  return (
    <article className="trade-page__card">
      <div className="trade-page__card-media" data-reveal-media>
        <CropImage
          src={card.image}
          focus={card.imageFocus}
          zoom={card.imageFocus.zoom}
          height={720}
          alt=""
          className="trade-page__card-crop"
        />
      </div>
      <div className="trade-page__card-body">
        <h2 className="trade-page__card-title">{card.title}</h2>
        <p className="trade-page__card-text">{card.text}</p>
        {card.cta && card.href ? (
          <Button as={Link} variant="secondary" withArrow to={card.href}>
            {card.cta}
          </Button>
        ) : null}
      </div>
    </article>
  )
}
