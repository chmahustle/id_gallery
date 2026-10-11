import { useEffect, useMemo } from 'react'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import {
  collectBrands,
  collectStatuses,
  filterProducts,
  getCategoryBySlug,
  paginate,
  parseCatalogSearch,
  priceBounds,
  sortProducts,
} from '../catalog/catalog'
import { products } from '../content'
import { useContent } from '../content/ContentContext'
import CatalogFilters from '../components/catalog/CatalogFilters'
import CatalogSidebar from '../components/catalog/CatalogSidebar'
import CatalogToolbar from '../components/catalog/CatalogToolbar'
import Pagination from '../components/catalog/Pagination'
import ProductGrid from '../components/catalog/ProductGrid'
import SiteShell from '../components/SiteShell'
import './Catalog.css'

export default function Catalog() {
  const { content, ready } = useContent()
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryKey = searchParams.toString()
  const filters = useMemo(
    () => parseCatalogSearch(new URLSearchParams(queryKey)),
    [queryKey],
  )

  const category = categorySlug
    ? getCategoryBySlug(categorySlug, content.catalogCategories)
    : null

  const scoped = useMemo(() => {
    if (!categorySlug) return products
    if (!category) return []
    return products.filter((item) => item.categorySlug === category.slug)
  }, [category, categorySlug])

  const brands = useMemo(() => collectBrands(scoped), [scoped])
  const statuses = useMemo(() => collectStatuses(scoped), [scoped])
  const bounds = useMemo(() => priceBounds(scoped), [scoped])

  // Категория уже отфильтрована по slug — не фильтруем по label
  // (иначе переименование категории в админке обнулит выдачу).
  const filtered = useMemo(
    () =>
      filterProducts(scoped, {
        sub: filters.sub,
        brand: filters.brand,
        status: filters.status,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
      }),
    [
      scoped,
      filters.sub,
      filters.brand,
      filters.status,
      filters.priceMin,
      filters.priceMax,
    ],
  )

  const sorted = useMemo(
    () => sortProducts(filtered, filters.sort),
    [filtered, filters.sort],
  )

  const pageData = useMemo(
    () => paginate(sorted, filters.page),
    [sorted, filters.page],
  )

  function updateParams(patch) {
    const merged = { ...filters, ...patch }
    const next = new URLSearchParams()

    if (merged.sub) next.set('sub', merged.sub)
    if (merged.brand) next.set('brand', merged.brand)
    if (merged.status) next.set('status', merged.status)
    if (merged.sort && merged.sort !== 'popular') next.set('sort', merged.sort)
    if (merged.page && merged.page > 1) next.set('page', String(merged.page))
    if (merged.priceMin != null && Number.isFinite(merged.priceMin)) {
      next.set('priceMin', String(merged.priceMin))
    }
    if (merged.priceMax != null && Number.isFinite(merged.priceMax)) {
      next.set('priceMax', String(merged.priceMax))
    }

    setSearchParams(next, { replace: true })
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [categorySlug, queryKey])

  useEffect(() => {
    if (filters.page === pageData.page) return
    const next = new URLSearchParams(queryKey)
    if (pageData.page <= 1) next.delete('page')
    else next.set('page', String(pageData.page))
    setSearchParams(next, { replace: true })
  }, [filters.page, pageData.page, queryKey, setSearchParams])

  useEffect(() => {
    const title = category?.label || 'Каталог'
    document.title = `${title} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [category?.label])

  if (!ready) {
    return <div className="page" aria-busy="true" />
  }

  if (categorySlug && !category) {
    return <Navigate to="/catalog" replace />
  }

  const title = category?.label || 'Каталог'

  return (
    <SiteShell variant="solid">
      <div className="catalog-page">
        <header className="catalog-page__head">
          <h1>{title}</h1>
          {filters.sub ? (
            <p className="catalog-page__sub">{filters.sub}</p>
          ) : (
            <p className="catalog-page__lead">
              Мебель, свет и декор ведущих фабрик — в наличии и под заказ
            </p>
          )}
        </header>

        <div className="catalog-page__layout">
          <CatalogSidebar
            categories={content.catalogCategories}
            activeSlug={category?.slug || ''}
            activeSub={filters.sub}
          />

          <div className="catalog-page__main">
            <CatalogFilters
              brands={brands}
              statuses={statuses}
              bounds={bounds}
              filters={filters}
              onChange={updateParams}
            />
            <CatalogToolbar
              total={pageData.total}
              sort={filters.sort}
              onSortChange={(sort) => updateParams({ sort, page: 1 })}
            />
            <ProductGrid products={pageData.items} />
            <Pagination
              page={pageData.page}
              totalPages={pageData.totalPages}
              onChange={(page) => updateParams({ page })}
            />
          </div>
        </div>
      </div>
    </SiteShell>
  )
}
