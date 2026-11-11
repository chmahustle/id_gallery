import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { brands } from '../../data/brands'

export function AboutBrandList() {
  return (
    <ul className="about-page__brand-list">
      {brands.map((brand) => (
        <li key={brand.slug} className="about-page__brand-item">
          <Link
            to={`/brands/${brand.slug}/`}
            className="about-page__brand-link"
          >
            <span className="about-page__brand-name">{brand.name}</span>
            <ArrowRight
              className="about-page__brand-arrow"
              size={32}
              strokeWidth={1.25}
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}
