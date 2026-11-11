import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  collectBrands,
  filterProducts,
  getCategoryBySlug,
  paginate,
  parseCatalogSearch,
  sortProducts,
} from '../../catalog/catalog'
import {
  collectColorFacets,
  collectMaterialFacets,
  collectSizeFacets,
  countActiveCatalogFilters,
} from '../../catalog/filter-facets'
import { categories } from '../../data/categories'
import { rooms } from '../../data/rooms'
import { searchProducts } from '../../lib/search'
import { getProducts } from '../../lib/catalog'
import { handleFocusTrapKeyDown } from '../../lib/focus-trap'

export function useCatalogFilters() {
  const navigate = useNavigate()
  const { categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState('grid3')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const drawerRef = useRef(null)
  const openerRef = useRef(null)
  const closeBtnRef = useRef(null)
  const queryKey = searchParams.toString()
  const allProducts = useMemo(() => getProducts(), [])
  /* ?brand= принимает slug или название; неизвестный бренд — каталог без фильтра */
  const filters = useMemo(() => {
    const parsed = parseCatalogSearch(new URLSearchParams(queryKey))
    if (!parsed.brand) return parsed
    const key = parsed.brand.toLowerCase()
    const match = allProducts.find(
      (item) => item.brand === parsed.brand || item.brandSlug === key,
    )
    return {
      ...parsed,
      brand: match ? match.brand : '',
      brandSlug: match ? match.brandSlug : '',
    }
  }, [queryKey, allProducts])

  const categoryFromPath = categorySlug
    ? getCategoryBySlug(categorySlug, categories)
    : null
  const categoryFromQuery = filters.category
    ? getCategoryBySlug(filters.category, categories)
    : null
  const category = categoryFromPath || categoryFromQuery
  const activeCategorySlug = category?.slug || ''
  const invalidCategory = Boolean(categorySlug && !categoryFromPath)

  const brands = useMemo(() => collectBrands(allProducts), [allProducts])
  const materials = useMemo(
    () => collectMaterialFacets(allProducts),
    [allProducts],
  )
  const sizes = useMemo(() => collectSizeFacets(allProducts), [allProducts])
  const colors = useMemo(() => collectColorFacets(allProducts), [allProducts])

  /* Запрос ?q=: только найденные товары; бренд из адреса игнорируется */
  const searching = Boolean(filters.q && filters.q.trim())
  const searchBase = useMemo(
    () => (searching ? searchProducts(allProducts, filters.q) : allProducts),
    [allProducts, searching, filters.q],
  )
  const effBrand = searching ? '' : filters.brand

  /* Комнаты, в которых есть товары (при выбранном бренде — товары этого бренда):
     одинаково для строки и панели */
  const availableRooms = useMemo(
    () =>
      rooms.filter(
        (room) =>
          filterProducts(searchBase, { room: room.slug, brand: effBrand })
            .length > 0,
      ),
    [searchBase, effBrand],
  )

  const filtered = useMemo(
    () =>
      filterProducts(searchBase, {
        categorySlug: activeCategorySlug || undefined,
        sub: filters.sub,
        room: filters.room,
        brand: effBrand,
        materials: filters.materials,
        sizes: filters.sizes,
        colors: filters.colors,
        q: '',
      }),
    [
      searchBase,
      activeCategorySlug,
      filters.sub,
      filters.room,
      effBrand,
      filters.materials,
      filters.sizes,
      filters.colors,
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

  const filterCount = countActiveCatalogFilters({
    category: activeCategorySlug,
    room: filters.room,
    brand: filters.brand,
    materials: filters.materials,
    sizes: filters.sizes,
    colors: filters.colors,
  })

  function updateParams(patch) {
    const merged = { ...filters, ...patch }
    const next = new URLSearchParams()
    if (merged.q) next.set('q', merged.q)
    if (!categoryFromPath && merged.category) {
      next.set('category', merged.category)
    }
    if (merged.sub) next.set('sub', merged.sub)
    if (merged.room) next.set('room', merged.room)
    if (merged.brand) {
      /* в адресе бренд хранится slug-ом */
      const hit = allProducts.find(
        (item) =>
          item.brand === merged.brand ||
          item.brandSlug === String(merged.brand).toLowerCase(),
      )
      next.set('brand', hit ? hit.brandSlug : merged.brand)
    }
    for (const value of merged.materials || []) next.append('material', value)
    for (const value of merged.sizes || []) next.append('size', value)
    for (const value of merged.colors || []) next.append('color', value)
    if (merged.sort && merged.sort !== 'default') next.set('sort', merged.sort)
    if (merged.page && merged.page > 1) next.set('page', String(merged.page))
    setSearchParams(next, { replace: true })
  }

  function openFilters(fromEl) {
    openerRef.current = fromEl || null
    setFiltersOpen(true)
  }

  function closeFilters() {
    setFiltersOpen(false)
    window.requestAnimationFrame(() => {
      openerRef.current?.focus?.()
    })
  }

  function resetFilters() {
    const qs = new URLSearchParams()
    if (filters.sort && filters.sort !== 'default') {
      qs.set('sort', filters.sort)
    }
    if (filters.q) qs.set('q', filters.q)
    navigate(qs.toString() ? `/catalog?${qs}` : '/catalog')
  }

  /* Снять категорию, даже если она задана путём /catalog/:slug */
  function clearCategory() {
    if (!categoryFromPath) {
      updateParams({ category: '', sub: '', page: 1 })
      return
    }
    const next = new URLSearchParams(queryKey)
    next.delete('page')
    navigate(next.toString() ? `/catalog?${next}` : '/catalog')
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
    document.title = `${searching ? 'Поиск' : category?.label || 'Все товары'} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [category?.label, searching])

  useEffect(() => {
    if (!filtersOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeFilters()
        return
      }
      if (drawerRef.current) handleFocusTrapKeyDown(drawerRef.current, event)
    }
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    window.addEventListener('keydown', onKeyDown)
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 40)
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      window.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(focusTimer)
    }
  }, [filtersOpen])

  return {
    invalidCategory,
    category,
    title: searching ? 'Поиск' : category?.label || 'Все товары',
    searching,
    view,
    setView,
    filters,
    filtersOpen,
    filterCount,
    pageData,
    filteredCount: filtered.length,
    brands,
    availableRooms,
    materials,
    sizes,
    colors,
    activeCategorySlug,
    drawerRef,
    closeBtnRef,
    openFilters,
    closeFilters,
    resetFilters,
    clearCategory,
    updateParams,
  }
}
