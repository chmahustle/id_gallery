import { Link, Navigate, useLocation, useNavigationType } from 'react-router-dom'
import { CatalogFiltersDrawer } from '../components/catalog/CatalogFiltersDrawer'
import CatalogToolbar from '../components/catalog/CatalogToolbar'
import Pagination from '../components/catalog/Pagination'
import ProductGrid from '../components/catalog/ProductGrid'
import SiteShell from '../components/SiteShell'
import { Button, Reveal } from '../components/ui'
import { catalogCopy, categories } from '../data/categories'
import { interiors } from '../data/interiors'
import { getRoomBySlug } from '../data/rooms'
import { getBrandBySlug } from '../lib/catalog'
import SearchNotFound from '../components/search/SearchNotFound'
import { useCatalogFilters } from '../features/catalog/useCatalogFilters'
import './Catalog.css'

export default function Catalog() {
  const catalog = useCatalogFilters()
  const location = useLocation()
  /* «Назад» из карточки — выдача на месте, без повторного проявления */
  const returning = useNavigationType() === 'POP'

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
  /* комната — главное условие: заголовок по комнате, фабрика — строкой ограничения */
  const roomHeading = roomInfo && !searching && !catalog.category
  const brandOfRoom =
    roomHeading && filters.brandSlug ? getBrandBySlug(filters.brandSlug) : null
  /* интерьер этой комнаты: сначала с той же фабрикой, иначе любой этой комнаты */
  const roomInterior = roomHeading
    ? (brandOfRoom &&
        interiors.find(
          (item) => item.room === roomInfo.slug && item.brands?.includes(brandOfRoom.slug),
        )) ||
      interiors.find((item) => item.room === roomInfo.slug) ||
      null
    : null
  /* анимация сетки — при смене фильтров и страницы, но не на каждую букву поиска */
  const gridParams = new URLSearchParams(location.search)
  gridParams.delete('q')
  const gridKey = `${location.pathname}?${gridParams}`
  const extraFilterCount =
    filters.materials.length + filters.sizes.length + filters.colors.length
  const allActive =
    !searching &&
    !filters.brand &&
    !filters.room &&
    !catalog.activeCategorySlug &&
    extraFilterCount === 0

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
          <h1>{roomHeading ? roomInfo.label : brandInfo ? brandInfo.name : catalog.title}</h1>
          {roomHeading ? (
            <p className="catalog-page__lead">
              {brandOfRoom
                ? `Модели ${brandOfRoom.name} для комнаты «${roomInfo.label}».`
                : `Модели для комнаты «${roomInfo.label}» из ассортимента ID Gallery.`}
            </p>
          ) : searching ? (
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
              {catalogCopy.allLead}
            </p>
          )}
        </Reveal>

        <Reveal className="catalog-page__layout" stagger>
          <div className="catalog-page__tools">
            <CatalogToolbar
              allActive={allActive}
              brand={searching ? '' : filters.brand}
              brands={searching ? [] : catalog.brands}
              room={filters.room}
              rooms={catalog.availableRooms}
              category={catalog.activeCategorySlug}
              categories={categories}
              extraFilterCount={extraFilterCount}
              filtersOpen={catalog.filtersOpen}
              onBrandChange={(brand) => catalog.updateParams({ brand, page: 1 })}
              onRoomChange={(room) => catalog.updateParams({ room, page: 1 })}
              onCategoryChange={catalog.setCategory}
              onOpenFilters={catalog.openFilters}
              sort={filters.sort}
              view={catalog.view}
              count={catalog.filteredCount}
              onSortChange={(sort) => catalog.updateParams({ sort, page: 1 })}
              onViewChange={catalog.setView}
            />
          </div>

          <div className="catalog-page__main">
            {catalog.filteredCount === 0 && searching ? (
              <SearchNotFound
                onClear={() => catalog.updateParams({ q: '', page: 1 })}
              />
            ) : catalog.filteredCount === 0 ? (
              <div className="catalog-empty" role="status">
                <div className="catalog-empty__copy">
                  <h2 className="catalog-empty__title">
                    Нет моделей с такими фильтрами
                  </h2>
                  <p className="catalog-empty__text">
                    Снимите один фильтр или откройте весь каталог.
                  </p>
                </div>
                <div className="catalog-empty__actions">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={catalog.resetFilters}
                  >
                    Сбросить фильтры
                  </Button>
                  {catalog.hasEntry ? (
                    <Button as="link" to="/catalog" variant="secondary">
                      Все товары
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
            <ProductGrid
              products={catalog.pageData.items}
              view={catalog.view}
              animationKey={gridKey}
              animate={!returning}
            />
            <Pagination
              page={catalog.pageData.page}
              totalPages={catalog.pageData.totalPages}
              onChange={(page) => catalog.updateParams({ page })}
            />

            {roomInterior?.image ? (
              <section className="catalog-room-interior" aria-labelledby="catalog-room-interior">
                <Link
                  className="catalog-room-interior__media"
                  to={`/interiors/${roomInterior.slug}/`}
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <img src={roomInterior.image} alt="" loading="lazy" />
                </Link>
                <div className="catalog-room-interior__body">
                  <h2 id="catalog-room-interior" className="catalog-room-interior__title">
                    {`${roomInfo.label} в интерьере`}
                  </h2>
                  <p className="catalog-page__lead">Посмотрите сочетание предметов в пространстве.</p>
                  <Button
                    as="link"
                    to={`/interiors/${roomInterior.slug}/`}
                    variant="secondary"
                    withArrow
                  >
                    Смотреть интерьер
                  </Button>
                </div>
              </section>
            ) : null}
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
