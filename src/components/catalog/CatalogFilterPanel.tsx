import { useState } from 'react'
import { catalogPath } from '../../catalog/catalog'
import type { ColorFacet } from '../../catalog/filter-facets'
import type { Room } from '../../data/rooms'
import type { Category } from '../../types'
import { CatalogFilterAccordion } from './CatalogFilterAccordion'
import { CatalogFilterChecks } from './CatalogFilterChecks'
import {
  CatalogFilterBrandNav,
  CatalogFilterCategoryNav,
} from './CatalogFilterNav'
import { CatalogFilterSwatches } from './CatalogFilterSwatches'

type CatalogFilterPanelProps = {
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
  linkParams?: Record<string, string | string[] | undefined>
  onBrandChange: (brand: string) => void
  onRoomChange: (room: string) => void
  onMaterialsChange: (values: string[]) => void
  onSizesChange: (values: string[]) => void
  onColorsChange: (values: string[]) => void
}

/** Материал, размер и цвет включаем после появления точных данных */
const SHOW_EXACT_FACETS = false

export function CatalogFilterPanel({
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
  linkParams = {},
  onBrandChange,
  onRoomChange,
  onMaterialsChange,
  onSizesChange,
  onColorsChange,
}: CatalogFilterPanelProps) {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({
    brand: true,
    room: true,
    category: true,
    material: false,
    size: false,
    color: false,
  })

  function toggleSection(key: string) {
    setOpenMap((current) => ({ ...current, [key]: !current[key] }))
  }

  function href(slug?: string, extra: Record<string, string> = {}) {
    const params: Record<string, string> = {}
    for (const [key, value] of Object.entries({ ...linkParams, ...extra })) {
      if (Array.isArray(value)) {
        if (value.length) params[key] = value.join('|')
      } else if (value) {
        params[key] = value
      }
    }
    return catalogPath(slug, params)
  }

  return (
    <div className="catalog-filter-panel">
      <CatalogFilterAccordion
        id="catalog-filter-brand"
        title="Бренд"
        open={openMap.brand}
        onToggle={() => toggleSection('brand')}
      >
        <CatalogFilterBrandNav
          brands={brands}
          activeBrand={activeBrand}
          onBrandChange={onBrandChange}
        />
      </CatalogFilterAccordion>

      <CatalogFilterAccordion
        id="catalog-filter-room"
        title="Комната"
        open={openMap.room}
        onToggle={() => toggleSection('room')}
      >
        <ul className="catalog-sidebar__brands">
          <li>
            <button
              type="button"
              className={`catalog-sidebar__all ${!activeRoom ? 'is-active' : ''}`}
              onClick={() => onRoomChange('')}
            >
              Все комнаты
            </button>
          </li>
          {rooms.map((room) => (
            <li key={room.slug}>
              <button
                type="button"
                className={activeRoom === room.slug ? 'is-active' : undefined}
                onClick={() =>
                  onRoomChange(activeRoom === room.slug ? '' : room.slug)
                }
              >
                {room.label}
              </button>
            </li>
          ))}
        </ul>
      </CatalogFilterAccordion>

      <CatalogFilterAccordion
        id="catalog-filter-category"
        title="Тип предмета"
        open={openMap.category}
        onToggle={() => toggleSection('category')}
      >
        <CatalogFilterCategoryNav
          categories={categories}
          activeSlug={activeSlug}
          activeSub={activeSub}
          href={href}
        />
      </CatalogFilterAccordion>

      {SHOW_EXACT_FACETS && materials.length > 0 ? (
        <CatalogFilterAccordion
          id="catalog-filter-material"
          title="Материал"
          open={openMap.material}
          onToggle={() => toggleSection('material')}
        >
          <CatalogFilterChecks
            values={materials}
            active={activeMaterials}
            onChange={onMaterialsChange}
          />
        </CatalogFilterAccordion>
      ) : null}

      {SHOW_EXACT_FACETS && sizes.length > 0 ? (
        <CatalogFilterAccordion
          id="catalog-filter-size"
          title="Размер"
          open={openMap.size}
          onToggle={() => toggleSection('size')}
        >
          <CatalogFilterChecks
            values={sizes}
            active={activeSizes}
            onChange={onSizesChange}
          />
        </CatalogFilterAccordion>
      ) : null}

      {SHOW_EXACT_FACETS && colors.length > 0 ? (
        <CatalogFilterAccordion
          id="catalog-filter-color"
          title="Цвет"
          open={openMap.color}
          onToggle={() => toggleSection('color')}
        >
          <CatalogFilterSwatches
            colors={colors}
            active={activeColors}
            onChange={onColorsChange}
          />
        </CatalogFilterAccordion>
      ) : null}
    </div>
  )
}
