import { Placeholder } from '../Placeholder'
import { Button } from '../ui'
import { catalogPath } from '../../catalog/catalog'
import type { Category } from '../../types'
import './CategoryCard.css'

export type CategoryCardProps = {
  category: Pick<Category, 'slug' | 'label' | 'description' | 'ctaLabel'>
  image?: string
}

export function CategoryCard({ category, image }: CategoryCardProps) {
  const href = catalogPath(category.slug)
  const cta = category.ctaLabel

  return (
    <article className="category-card">
      <div className="category-card__media">
        {image ? (
          <img
            src={image}
            alt=""
            className="category-card__image"
            loading="lazy"
            width={640}
            height={480}
          />
        ) : (
          <Placeholder variant="light" className="category-card__placeholder" />
        )}
      </div>

      <div className="category-card__body">
        <h3 className="category-card__title">{category.label}</h3>
        {category.description ? (
          <p className="category-card__desc">{category.description}</p>
        ) : null}
        {cta ? (
          <Button as="link" to={href} variant="secondary" withArrow>
            {cta}
          </Button>
        ) : null}
      </div>
    </article>
  )
}
