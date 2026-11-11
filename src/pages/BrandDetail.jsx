import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getBrandBySlug } from '../lib/catalog'
import SiteShell from '../components/SiteShell'
import { BrandPage } from '../features/brands/BrandPage'

/** Старый slug Molteni&C → канонический /brands/molteni/ */
const SLUG_ALIASES = {
  molteniandc: 'molteni',
  'molteni-c': 'molteni',
}

export default function BrandDetail() {
  const { brandSlug: rawSlug } = useParams()
  const slug = SLUG_ALIASES[rawSlug] || rawSlug
  const brand = getBrandBySlug(slug)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  useEffect(() => {
    if (!brand) return undefined
    document.title = `${brand.name} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [brand])

  if (rawSlug && SLUG_ALIASES[rawSlug]) {
    return <Navigate to={`/brands/${slug}`} replace />
  }

  if (!brand) {
    return <Navigate to="/brands" replace />
  }

  return (
    <SiteShell variant="overlay">
      <BrandPage brand={brand} />
    </SiteShell>
  )
}
