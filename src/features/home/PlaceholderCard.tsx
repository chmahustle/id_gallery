import AppLink from '../../components/AppLink'
import { Placeholder } from '../../components/Placeholder'
import './home-sections.css'

type PlaceholderCardProps = {
  title: string
  href: string
  className?: string
}

/** @deprecated предпочитайте Placeholder + подпись в секции */
export function PlaceholderCard({
  title,
  href,
  className,
}: PlaceholderCardProps) {
  return (
    <AppLink
      to={href}
      className={['home-ph-card', className].filter(Boolean).join(' ')}
    >
      <span className="home-ph-card__media">
        <Placeholder showBadge label={title} />
      </span>
      <span className="home-ph-card__title">{title}</span>
    </AppLink>
  )
}
