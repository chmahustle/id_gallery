import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { type MouseEvent, useId, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productPath } from '../../catalog/catalog'
import { CatalogCover } from '../../components/CatalogCover'
import { Button } from '../../components/ui'
import { brands } from '../../data/brands'
import { categories } from '../../data/categories'
import {
  getLibraryCatalogs,
  getLibraryModels,
  materialsCopy as copy,
  materialsRequestHref,
} from '../../data/materials'
import { resolveBrandName } from '../../lib/catalog'
import './MaterialsPage.css'

const PAGE = 12

type View = 'catalogs' | 'docs'

/** Заглушка «#» не уводит со страницы */
const stay = (url: string) => (event: MouseEvent) => {
  if (url === '#') event.preventDefault()
}

type ChipsProps = {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

/** Ряд кнопок-фильтров: все варианты видны сразу, выбранный залит */
function Chips({ label, value, options, onChange }: ChipsProps) {
  return (
    <div className="materials-page__chips" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value || 'all'}
          type="button"
          aria-pressed={value === option.value}
          className={value === option.value ? 'is-active' : undefined}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/**
 * /materials/ — одна библиотека. Сначала выбор «что ищем» (вкладки),
 * затем фабрика (общая для вкладок), для документов — тип и поиск.
 * Вкладка и фабрика — в адресе: ?view=docs&brand=…
 */
export function MaterialsPage() {
  const baseId = useId()
  const [params, setParams] = useSearchParams()
  const brand = brands.find((item) => item.slug === params.get('brand'))
  const brandSlug = brand?.slug || ''
  const view: View = params.get('view') === 'docs' ? 'docs' : 'catalogs'

  const [limit, setLimit] = useState(PAGE)
  /* тип — внутри библиотеки, без параметра адреса */
  const [type, setType] = useState('')

  const catalogs = getLibraryCatalogs(brandSlug)
  const allModels = getLibraryModels(brandSlug)
  const typeOptions = [
    { value: '', label: copy.typeAll },
    ...categories
      .filter((item) => allModels.some(({ product }) => product.categorySlug === item.slug))
      .map((item) => ({ value: item.slug, label: item.label })),
  ]
  const activeType = typeOptions.some((item) => item.value === type) ? type : ''
  const models = allModels.filter(
    ({ product }) => !activeType || product.categorySlug === activeType,
  )
  const visibleModels = models.slice(0, limit)

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
    setLimit(PAGE)
  }

  const tabs: { id: View; label: string; count: number }[] = [
    { id: 'catalogs', label: copy.catalogsTitle, count: catalogs.length },
    { id: 'docs', label: copy.docsTitle, count: allModels.length },
  ]

  const brandOptions = [
    { value: '', label: copy.brandAll },
    ...brands.map((item) => ({ value: item.slug, label: item.name })),
  ]

  return (
    <article className="materials-page" aria-labelledby="materials-title">
      <header className="materials-page__head">
        <h1 id="materials-title" className="materials-page__title">
          {copy.title}
        </h1>
        <p className="materials-page__lead">{copy.lead}</p>
      </header>

      {/* что ищем: каталоги или документы */}
      <div className="materials-page__tabs" role="tablist" aria-label={copy.title}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`${baseId}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={view === tab.id}
            aria-controls={`${baseId}-panel`}
            className={view === tab.id ? 'is-active' : undefined}
            onClick={() => setParam('view', tab.id === 'docs' ? 'docs' : '')}
          >
            {tab.label}
            <span className="materials-page__count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* чей: фабрика — общая для обеих вкладок */}
      <div className="materials-page__filters">
        <Chips
          label={copy.brandLabel}
          value={brandSlug}
          options={brandOptions}
          onChange={(next) => setParam('brand', next)}
        />
      </div>

      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${view}`}
        className="materials-page__panel"
      >
        {view === 'catalogs' ? (
          catalogs.length ? (
            <div className="materials-page__covers">
              {catalogs.map((item) => (
                <CatalogCover
                  key={`${item.brandSlug}-${item.title}`}
                  item={item}
                  brandName={brand ? undefined : item.brandName}
                />
              ))}
            </div>
          ) : (
            <p className="materials-page__empty">{copy.noCatalogs}</p>
          )
        ) : (
          <>
            {/* тип предмета — как на странице комнаты: текстом, выбранный подчёркнут */}
            {typeOptions.length > 2 ? (
              <div className="materials-page__types" role="group" aria-label={copy.typeLabel}>
                <span className="materials-page__types-label">{copy.typeLabel}</span>
                {typeOptions.map((option) => (
                  <button
                    key={option.value || 'all'}
                    type="button"
                    aria-pressed={activeType === option.value}
                    className={activeType === option.value ? 'is-active' : undefined}
                    onClick={() => {
                      setType(option.value)
                      setLimit(PAGE)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            {models.length ? (
              <ul className="materials-page__models">
                {visibleModels.map(({ product, published, pending }) => (
                  <li key={product.slug} className="materials-page__model">
                    {product.image ? (
                      <Link
                        className="materials-page__thumb"
                        to={productPath(product.slug)}
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <img src={product.image} alt="" loading="lazy" />
                      </Link>
                    ) : null}
                    <div className="materials-page__model-info">
                      <Link className="materials-page__model-name" to={productPath(product.slug)}>
                        {`${resolveBrandName(product)} · ${product.name}`}
                      </Link>
                      <span className="materials-page__model-type">
                        {categories.find((item) => item.slug === product.categorySlug)?.singular ||
                          product.category}
                      </span>
                      <ul className="materials-page__docs">
                        {published.map((doc) => (
                          <li key={doc.title}>
                            <a
                              className="materials-page__doc"
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${copy.openDocument}: ${doc.title}, ${doc.format}`}
                              onClick={stay(doc.url)}
                            >
                              {`${doc.title}, ${doc.format}`}
                              <ArrowUpRight size={14} aria-hidden="true" />
                            </a>
                          </li>
                        ))}
                        {pending.map((doc) => (
                          <li key={doc.title} className="materials-page__doc-pending">
                            <span>{`${doc.title} · ${copy.notPublished}`}</span>
                            <Link
                              className="materials-page__doc"
                              to={materialsRequestHref(product.brandSlug, product.slug)}
                            >
                              {copy.requestMaterials}
                              <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="materials-page__empty">{copy.nothingFound}</p>
            )}
            {models.length > limit ? (
              <button
                type="button"
                className="materials-page__more"
                onClick={() => setLimit((current) => current + PAGE)}
              >
                {`${copy.showMore} · ${models.length - limit}`}
              </button>
            ) : null}
          </>
        )}
      </div>

      <section className="materials-page__request" aria-labelledby="materials-request">
        <h2 id="materials-request" className="materials-page__request-title">
          {copy.requestTitle}
        </h2>
        <p className="materials-page__lead">{copy.requestText}</p>
        <Button as={Link} variant="primary" withArrow to={materialsRequestHref(brandSlug)}>
          {copy.requestMaterials}
        </Button>
      </section>
    </article>
  )
}
