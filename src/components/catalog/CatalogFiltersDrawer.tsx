import { ListFilter, Search, X } from 'lucide-react'
import type { RefObject } from 'react'
import type { ColorFacet } from '../../catalog/filter-facets'
import type { Room } from '../../data/rooms'
import type { Category } from '../../types'
import { Button } from '../ui'
import { CatalogFilterPanel } from './CatalogFilterPanel'

type CatalogFiltersDrawerProps = {
  open: boolean
  drawerRef: RefObject<HTMLElement | null>
  closeBtnRef: RefObject<HTMLButtonElement | null>
  resultCount: number
  q: string
  categories: Category[]
  brands: string[]
  rooms: Room[]
  materials: string[]
  sizes: string[]
  colors: ColorFacet[]
  activeSlug: string
  activeSub: string
  activeBrand: string
  activeRoom: string
  activeMaterials: string[]
  activeSizes: string[]
  activeColors: string[]
  linkParams: Record<string, string | string[] | undefined>
  onOpen: (el: HTMLElement) => void
  onClose: () => void
  onReset: () => void
  onQueryChange: (q: string) => void
  onBrandChange: (brand: string) => void
  onRoomChange: (room: string) => void
  onMaterialsChange: (values: string[]) => void
  onSizesChange: (values: string[]) => void
  onColorsChange: (values: string[]) => void
}

export function CatalogFiltersDrawer({
  open,
  drawerRef,
  closeBtnRef,
  resultCount,
  q,
  categories,
  brands,
  rooms,
  materials,
  sizes,
  colors,
  activeSlug,
  activeSub,
  activeBrand,
  activeRoom,
  activeMaterials,
  activeSizes,
  activeColors,
  linkParams,
  onOpen,
  onClose,
  onReset,
  onQueryChange,
  onBrandChange,
  onRoomChange,
  onMaterialsChange,
  onSizesChange,
  onColorsChange,
}: CatalogFiltersDrawerProps) {
  return (
    <>
      <button
        type="button"
        className={`catalog-fab ${open ? 'is-hidden' : ''}`}
        aria-expanded={open}
        aria-controls="catalog-filters"
        aria-label="Открыть фильтры"
        onClick={(event) => onOpen(event.currentTarget)}
      >
        <ListFilter size={16} strokeWidth={1.4} aria-hidden="true" />
        <span>Фильтры</span>
      </button>

      <button
        type="button"
        className={`catalog-drawer__backdrop ${open ? 'is-open' : ''}`}
        aria-label="Закрыть фильтры"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />

      <aside
        id="catalog-filters"
        ref={drawerRef}
        className={`catalog-drawer ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Фильтры"
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="catalog-drawer__head">
          <p className="catalog-drawer__title">Фильтры</p>
          <button
            type="button"
            className="catalog-drawer__close"
            aria-label="Закрыть"
            ref={closeBtnRef}
            onClick={onClose}
          >
            <X size={20} strokeWidth={1.2} />
          </button>
        </div>

        <div className="catalog-drawer__body">
          <label className="catalog-page__search">
            <Search size={15} strokeWidth={1.4} aria-hidden="true" />
            <span className="sr-only">Поиск</span>
            <input
              type="search"
              name="q"
              placeholder="Поиск"
              value={q}
              onChange={(event) => onQueryChange(event.target.value)}
              autoComplete="off"
            />
          </label>

          <CatalogFilterPanel
            categories={categories}
            brands={brands}
            rooms={rooms}
            materials={materials}
            sizes={sizes}
            colors={colors}
            activeSlug={activeSlug}
            activeSub={activeSub}
            activeBrand={activeBrand}
            activeRoom={activeRoom}
            activeMaterials={activeMaterials}
            activeSizes={activeSizes}
            activeColors={activeColors}
            linkParams={linkParams}
            onBrandChange={onBrandChange}
            onRoomChange={onRoomChange}
            onMaterialsChange={onMaterialsChange}
            onSizesChange={onSizesChange}
            onColorsChange={onColorsChange}
          />
        </div>

        <div className="catalog-drawer__foot">
          <Button type="button" variant="primary" fullWidthMobile onClick={onClose}>
            {`Показать результаты (${resultCount})`}
          </Button>
          <Button type="button" variant="secondary" fullWidthMobile onClick={onReset}>
            Сбросить фильтры
          </Button>
        </div>
      </aside>
    </>
  )
}
