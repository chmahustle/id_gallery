export function brandSlug(name = '') {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
}

export function brandPath(brand) {
  const slug = brand?.slug || brandSlug(brand?.name || brand?.filter || '')
  return `/brands/${slug}`
}

export function findBrandBySlug(slug, items = []) {
  return (
    items.find(
      (item) =>
        item.slug === slug ||
        brandSlug(item.name) === slug ||
        brandSlug(item.filter) === slug,
    ) || null
  )
}
