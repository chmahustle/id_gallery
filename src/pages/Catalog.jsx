import { Link, Navigate } from 'react-router-dom'
import { CatalogFiltersDrawer } from '../components/catalog/CatalogFiltersDrawer'
import { RoomTabs } from '../components/catalog/RoomTabs'
import CatalogToolbar from '../components/catalog/CatalogToolbar'
import Pagination from '../components/catalog/Pagination'
import ProductGrid from '../components/catalog/ProductGrid'
import SiteShell from '../components/SiteShell'
import { Reveal } from '../components/ui'
import { categories } from '../data/categories'
import { getRoomBySlug } from '../data/rooms'
import { getBrandBySlug } from '../lib/catalog'
import SearchNotFound from '../components/search/SearchNotFound'
import { useCatalogFilters } from '../features/catalog/useCatalogFilters'
import './Catalog.css'

export default function Catalog() {
  const catalog = useCatalogFilters()

  if (catalog.invalidCategory) {
    return <Navigate to="/catalog" replace />
  }

  const { filters } = catalog
  const searching = catalog.searching
  const brandInfo =
    filters.brandSlug && !catalog.category && !searching
      ? getBrandBySlug(filters.brandSlug)
      : null
  const roomInfo = filters.room ? getRoomBySlug(filters.room) : null

  return (
    <SiteShell variant="solid">
      <div className="catalog-page">
        <nav className="catalog-page__crumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span aria-hidden="true">-</span>
          {searching ? (
            <>
              <Link to="/catalog">Каталог</Link>
              <span aria-hidden="true">-</span>
              <span>Поиск</span>
            </>
          ) : brandInfo ? (
            <>
              <Link to="/brands">Бренды</Link>
              <span aria-hidden="true">-</span>
              <Link to={`/brands/${brandInfo.slug}`}>{brandInfo.name}</Link>
              {roomInfo ? (
                <>
                  <span aria-hidden="true">-</span>
                  <span>{roomInfo.label}</span>
                </>
              ) : null}
            </>
          ) : catalog.category ? (
            <>
              <Link to="/catalog">Каталог</Link>
              <span aria-hidden="true">-</span>
              <span>{catalog.category.label}</span>
            </>
          ) : roomInfo ? (
            <>
              <Link to="/catalog">Каталог</Link>
              <span aria-hidden="true">-</span>
              <span>{roomInfo.label}</span>
            </>
          ) : (
            <span>Каталог</span>
          )}
        </nav>

        <Reveal as="header" className="catalog-page__head">
          <h1>{brandInfo ? brandInfo.name : catalog.title}</h1>
          {searching ? (
            <>
              <p className="catalog-page__lead">
                {`Результаты по запросу «${filters.q}»: ${catalog.filteredCount}.`}
              </p>
              <Link to="/catalog" className="catalog-page__all-link">
                Весь каталог ID Gallery
              </Link>
            </>
          ) : brandInfo ? (
            <p className="catalog-page__lead">
              {`Товары ${brandInfo.name} в каталоге ID Gallery.`}
            </p>
          ) : catalog.category?.description ? (
            <p className="catalog-page__lead">{catalog.category.description}</p>
          ) : (
            <p className="catalog-page__lead">
              Весь представленный в ID Gallery ассортимент четырёх брендов.
            </p>
          )}
        </Reveal>

        <Reveal className="catalog-page__layout" stagger>
          <div className="catalog-page__tools">
            {catalog.availableRooms.length > 0 ? (
              <RoomTabs
                rooms={catalog.availableRooms}
                value={filters.room}
                onChange={(room) => catalog.updateParams({ room, page: 1 })}
              />
            ) : null}
            <CatalogToolbar
              sort={filters.sort}
              view={catalog.view}
              count={catalog.filteredCount}
              onSortChange={(sort) => catalog.updateParams({ sort, page: 1 })}
              onViewChange={catalog.setView}
            />
          </div>

          <div className="catalog-page__main">
            {catalog.filteredCount === 0 && searching ? (
              <SearchNotFound query={filters.q} />
            ) : catalog.filteredCount === 0 ? (
              <div className="catalog-empty" role="status">
                <p>По выбранным условиям товаров нет.</p>
                <button
                  type="button"
                  className="catalog-empty__reset"
                  onClick={catalog.resetFilters}
                >
                  Сбросить условия
                </button>
              </div>
            ) : null}
            <ProductGrid
              products={catalog.pageData.items}
              view={catalog.view}
            />
            <Pagination
              page={catalog.pageData.page}
              totalPages={catalog.pageData.totalPages}
              onChange={(page) => catalog.updateParams({ page })}
            />
          </div>
        </Reveal>
      </div>

      <CatalogFiltersDrawer
        open={catalog.filtersOpen}
        drawerRef={catalog.drawerRef}
        closeBtnRef={catalog.closeBtnRef}
        resultCount={catalog.filteredCount}
        q={filters.q}
        categories={categories}
        brands={catalog.brands}
        rooms={catalog.availableRooms}
        materials={catalog.materials}
        sizes={catalog.sizes}
        colors={catalog.colors}
        activeSlug={catalog.activeCategorySlug}
        activeSub={filters.sub}
        activeBrand={filters.brand}
        activeRoom={filters.room}
        activeMaterials={filters.materials}
        activeSizes={filters.sizes}
        activeColors={filters.colors}
        linkParams={{
          room: filters.room,
          brand: filters.brand,
          material: filters.materials,
          size: filters.sizes,
          color: filters.colors,
          q: filters.q,
          sort: filters.sort !== 'default' ? filters.sort : '',
        }}
        onOpen={catalog.openFilters}
        onClose={catalog.closeFilters}
        onReset={catalog.resetFilters}
        onQueryChange={(q) => catalog.updateParams({ q, page: 1 })}
        onBrandChange={(brand) => catalog.updateParams({ brand, page: 1 })}
        onRoomChange={(room) => catalog.updateParams({ room, page: 1 })}
        onMaterialsChange={(materials) =>
          catalog.updateParams({ materials, page: 1 })
        }
        onSizesChange={(sizes) => catalog.updateParams({ sizes, page: 1 })}
        onColorsChange={(colors) => catalog.updateParams({ colors, page: 1 })}
      />
    </SiteShell>
  )
}
