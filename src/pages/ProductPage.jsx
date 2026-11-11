import { ArrowLeft, ArrowRight, ChevronDown, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  catalogPath,
  getProductBySlug,
  getRelatedProducts,
} from '../catalog/catalog'
import {
  flattenFinishes,
  getProductFinishGroups,
} from '../catalog/finishes'
import { ProductCard } from '../components/catalog/ProductCard'
import { Placeholder } from '../components/Placeholder'
import SiteShell from '../components/SiteShell'
import { Button, Reveal, SectionLabel } from '../components/ui'
import { useCart } from '../cart/CartContext'
import { featureFlags } from '../data/featureFlags'
import { CropImage } from '../features/brands/CropImage'
import {
  getApprovedSpecs,
  getPlaceholderSpecs,
  getProducts as getAllProducts,
  resolveBrandName,
} from '../lib/catalog'
import { resolveProductDevPreview } from './productDevPreview'
import { getPreviousLocation } from '../lib/navHistory'
import { getProductRooms, getRoomBySlug, getRoomProducts } from '../lib/rooms'
import { buildGalleryFrames } from './productGalleryFrames'
import './ProductPage.css'

const PREVIEW_SWATCH_LIMIT = 4
const PRICE_LABEL = 'Стоимость — по запросу'
const RELATED_MIN = 2
const RELATED_LIMIT = 4
/** Заглушка «#» не должна уводить со страницы */
const stayOnPage = (url) => (event) => {
  if (url === '#') event.preventDefault()
}

function DemoBadge({ label }) {
  if (!label) return null
  return <span className="product-page__demo-badge">{label}</span>
}

function ProductGallery({ frames, name, brand, demoLabel }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [fadeKey, setFadeKey] = useState(0)
  const current = frames[activeIndex] || frames[0]

  useEffect(() => {
    setActiveIndex(0)
    setFadeKey((k) => k + 1)
  }, [frames])

  function selectFrame(index) {
    if (index === activeIndex) return
    setActiveIndex(index)
    setFadeKey((k) => k + 1)
  }

  if (!frames.length) {
    return (
      <div className="product-page__gallery">
        <div className="product-page__main-image product-page__main-image--empty">
          <Placeholder variant="light" label="" className="product-page__ph" />
          <DemoBadge label={demoLabel} />
        </div>
      </div>
    )
  }

  return (
    <div className="product-page__gallery">
      <div className="product-page__main-image">
        <div key={fadeKey} className="product-page__main-fade">
          <CropImage
            src={current.src}
            focus={current.focus}
            zoom={current.focus.zoom}
            height={800}
            alt={`${name}, ${brand}`}
            className="product-page__crop"
          />
        </div>
        <DemoBadge label={demoLabel} />
      </div>

      {frames.length > 1 ? (
        <ul className="product-page__thumbs" aria-label="Миниатюры">
          {frames.map((frame, index) => (
            <li key={`${frame.src}-${index}-${frame.focus.x}`}>
              <button
                type="button"
                className={index === activeIndex ? 'is-active' : undefined}
                onClick={() => selectFrame(index)}
                aria-label={`Фото ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              >
                <CropImage
                  src={frame.src}
                  focus={frame.focus}
                  zoom={frame.focus.zoom}
                  height={96}
                  alt=""
                  className="product-page__thumb-crop"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function Accordion({ id, title, open, onToggle, children, demoLabel }) {
  const panelId = `${id}-panel`
  return (
    <div className={`product-acc ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="product-acc__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span>
          {title}
          <DemoBadge label={demoLabel} />
        </span>
        <ChevronDown size={16} strokeWidth={1.4} aria-hidden="true" />
      </button>
      <div
        id={panelId}
        className="product-acc__panel"
        role="region"
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="product-acc__panel-inner">{children}</div>
      </div>
    </div>
  )
}

function FinishesDrawer({
  open,
  onClose,
  groups,
  activeColorId,
  onSelect,
  demoLabel,
}) {
  useEffect(() => {
    if (!open) return undefined

    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }

    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <>
      <button
        type="button"
        className={`finishes-drawer__backdrop ${open ? 'is-open' : ''}`}
        aria-label="Закрыть варианты исполнения"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={`finishes-drawer ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Варианты исполнения"
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="finishes-drawer__head">
          <p className="finishes-drawer__title">
            Варианты исполнения
            <DemoBadge label={demoLabel} />
          </p>
          <button
            type="button"
            className="finishes-drawer__close"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <X size={20} strokeWidth={1.2} />
          </button>
        </div>

        <div className="finishes-drawer__body">
          {groups.map((group) => (
            <section key={group.id} className="finishes-drawer__group">
              <h3 className="finishes-drawer__group-title">{group.title}</h3>
              {group.materials.map((material) => (
                <div key={material.name} className="finishes-drawer__material">
                  <div
                    className="finishes-drawer__grid"
                    role="listbox"
                    aria-label={material.name}
                  >
                    {material.colors.map((color) => {
                      const selected = color.id === activeColorId
                      return (
                        <button
                          key={color.id}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          className={`finishes-drawer__swatch ${selected ? 'is-active' : ''}`}
                          onClick={() => onSelect(color)}
                        >
                          <span
                            className="finishes-drawer__chip"
                            style={{
                              background:
                                color.swatch ||
                                color.hex ||
                                'var(--color-swatch-fallback)',
                            }}
                          />
                          <span className="finishes-drawer__name">
                            {color.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </section>
          ))}
        </div>
      </aside>
    </>
  )
}

export default function ProductPage() {
  const { productSlug } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const baseProduct = getProductBySlug(productSlug)
  const { addItem } = useCart()
  const [openAcc, setOpenAcc] = useState('specs')
  const [activeColorId, setActiveColorId] = useState(null)
  const [finishesOpen, setFinishesOpen] = useState(false)

  const showPh = featureFlags.showProductPlaceholders

  const preview = useMemo(() => {
    if (!baseProduct) return { product: null, active: false, badge: '' }
    if (!import.meta.env.DEV) {
      return { product: baseProduct, active: false, badge: '' }
    }
    return resolveProductDevPreview(baseProduct, searchParams.toString())
  }, [baseProduct, searchParams])

  const product = preview.product
  const demoLabel = preview.active ? preview.badge : ''

  useEffect(() => {
    window.scrollTo(0, 0)
    setOpenAcc('specs')
    setActiveColorId(null)
    setFinishesOpen(false)
  }, [productSlug, preview.active])

  useEffect(() => {
    if (!product) return undefined
    document.title = `${product.name} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [product])

  const brandName = product ? resolveBrandName(product) : ''

  /*
   * Связи под карточкой: коллекция → комната → бренд. Товар не повторяется
   * в двух блоках и не включает текущий; блок — от RELATED_MIN товаров, до 4.
   */
  const relatedBlocks = useMemo(() => {
    if (!product) return []
    const used = new Set([product.slug])
    const pick = (list) => {
      const images = new Set()
      const result = []
      for (const item of list) {
        if (used.has(item.slug)) continue
        const src = (item.image || item.images?.[0] || '').trim()
        if (src && images.has(src)) continue
        images.add(src)
        result.push(item)
        if (result.length === RELATED_LIMIT) break
      }
      return result
    }
    const blocks = []
    const add = (block, items) => {
      if (items.length < RELATED_MIN) return
      items.forEach((item) => used.add(item.slug))
      blocks.push({ ...block, items })
    }

    /* 1. Коллекция (пока ни у одного товара не заполнена — блок скрыт) */
    if (product.collection) {
      add(
        {
          id: 'collection',
          title: 'Другие предметы коллекции',
          linkLabel: 'Вся коллекция',
          linkHref: `/catalog?brand=${encodeURIComponent(product.brandSlug)}`,
        },
        pick(getAllProducts().filter((item) => item.collection === product.collection)),
      )
    }

    /* 2. Та же комната, любые бренды */
    const roomSlug = getProductRooms(product)[0]
    const room = roomSlug ? getRoomBySlug(roomSlug) : null
    if (room) {
      add(
        {
          id: 'room',
          title: 'Для этой комнаты',
          linkLabel: `Все товары: ${room.label}`,
          linkHref: `/catalog?room=${room.slug}`,
        },
        pick(getRoomProducts(room.slug)),
      )
    }

    /* 3. Другие модели бренда */
    add(
      {
        id: 'brand',
        title: `Другие модели ${brandName}`,
        linkLabel: `Все товары ${brandName}`,
        linkHref: `/catalog?brand=${encodeURIComponent(product.brandSlug)}`,
      },
      pick(getRelatedProducts(product, 50)),
    )
    return blocks
  }, [product, brandName])

  const galleryFrames = useMemo(
    () => (product ? buildGalleryFrames(product) : []),
    [product],
  )

  const productColors = useMemo(
    () =>
      Array.isArray(product?.colors)
        ? product.colors
        : product?.variants || [],
    [product],
  )
  const finishGroups = useMemo(
    () => getProductFinishGroups(productColors),
    [productColors],
  )
  const allFinishes = useMemo(
    () => flattenFinishes(finishGroups),
    [finishGroups],
  )
  const previewColors = productColors.slice(0, PREVIEW_SWATCH_LIMIT)
  const hasApprovedFinishes = productColors.some(
    (color) => color.status === 'approved',
  )
  const showFinishes =
    (hasApprovedFinishes || showPh) && productColors.length > 0

  const activeColor =
    allFinishes.find((color) => color.id === activeColorId) ||
    productColors[0] ||
    allFinishes[0] ||
    null

  const closeFinishes = useCallback(() => setFinishesOpen(false), [])

  function selectFinish(color) {
    setActiveColorId(color.id)
  }

  if (!product) {
    return <Navigate to="/catalog" replace />
  }

  const approvedSpecs = getApprovedSpecs(product)
  const placeholderSpecs = getPlaceholderSpecs(product)

  const realSummary = (product.summary || '').trim()
  const showRealSummary =
    Boolean(realSummary) &&
    (product.status === 'approved' || preview.active) &&
    !(/placeholder/i.test(realSummary) && !preview.active)
  const showSummary = showRealSummary
  const summaryText = showRealSummary ? realSummary : ''

  const showRealSpecs = approvedSpecs.length > 0
  const showPlaceholderSpecs = !showRealSpecs && showPh
  const specEntries = showRealSpecs
    ? approvedSpecs
    : showPlaceholderSpecs
      ? placeholderSpecs
      : []
  const showSpecs = specEntries.length > 0

  const documents = (product.documents || []).filter(
    (doc) => doc.title && doc.url,
  )
  const showDocuments = documents.length > 0
  const careText = (product.care || '').trim()
  const showCare = Boolean(careText)

  const requestHref = `/request/?type=offer&model=${encodeURIComponent(product.slug)}`

  /* «Назад к результатам» — только если пришли со списка внутри сайта */
  const previousPage = getPreviousLocation()
  const cameFromList =
    location.key !== 'default' &&
    previousPage &&
    /^\/(catalog|brands|interiors)(\/|$)/.test(previousPage.pathname)

  function toggleAcc(id) {
    setOpenAcc((current) => (current === id ? '' : id))
  }

  return (
    <SiteShell variant="solid">
      <div className="product-page">
        {cameFromList ? (
          <Link
            className="product-page__back"
            to={`${previousPage.pathname}${previousPage.search}`}
            onClick={(event) => {
              event.preventDefault()
              navigate(-1)
            }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Назад к результатам</span>
          </Link>
        ) : (
          <Link className="product-page__back" to="/catalog">
            <span>Все товары</span>
          </Link>
        )}

        <nav className="product-page__crumbs" aria-label="Хлебные крошки">
          <Link to="/">Главная</Link>
          <span aria-hidden="true">·</span>
          <Link to="/catalog">Каталог</Link>
          <span aria-hidden="true">·</span>
          <Link to={`/brands/${product.brandSlug}`}>{brandName}</Link>
          <span aria-hidden="true">·</span>
          <Link to={catalogPath(product.categorySlug)}>{product.category}</Link>
          <span aria-hidden="true">·</span>
          <span>{product.name}</span>
        </nav>

        <Reveal className="product-page__layout" stagger>
          <div className="product-page__media-col">
            <div id="product-photos" />
            <ProductGallery
              key={`${product.slug}-${preview.active ? 'demo' : 'live'}`}
              frames={galleryFrames}
              name={product.name}
              brand={brandName}
              demoLabel={demoLabel}
            />
          </div>

          <div className="product-page__info">
            <h1>
              <Link
                className="product-page__title-brand"
                to={`/brands/${product.brandSlug}`}
              >
                {brandName}
              </Link>
              <span className="product-page__title-sep" aria-hidden="true">
                {' '}
                ·{' '}
              </span>
              {product.name}
            </h1>

            {product.author?.name ? (
              <p className="product-page__author">
                Автор:{' '}
                {/* TODO: когда появится фильтр каталога по автору — вести на него */}
                <Link to={`/catalog?brand=${encodeURIComponent(product.brandSlug)}`}>
                  {product.author.name}
                </Link>
              </p>
            ) : null}

            {showSummary ? (
              <p className="product-page__summary">{summaryText}</p>
            ) : null}

            <div className="product-page__stack">
              <p className="product-page__price">{PRICE_LABEL}</p>

              <div className="product-page__actions">
                <Button as={Link} variant="primary" to={requestHref}>
                  Запросить предложение
                </Button>
                {featureFlags.showCommerce ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => addItem(product)}
                  >
                    Добавить в корзину
                  </Button>
                ) : null}
              </div>

              {showFinishes ? (
                <section
                  id="product-finishes"
                  className="product-page__block product-page__finishes"
                  aria-label="Варианты исполнения"
                >
                  <h2 className="product-page__finishes-title">
                    Варианты исполнения
                    <DemoBadge label={demoLabel} />
                  </h2>
                  {activeColor?.name ? (
                    <p className="product-page__finishes-current">
                      {activeColor.name}
                    </p>
                  ) : null}
                  <div
                    className="product-page__swatches"
                    role="listbox"
                    aria-label="Выбор образца"
                  >
                    {previewColors.map((color) => {
                      const selected = color.id === (activeColor?.id || null)
                      return (
                        <button
                          key={color.id}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          aria-label={color.name}
                          title={color.name}
                          className={`product-page__swatch ${selected ? 'is-active' : ''}`}
                          style={{
                            background:
                              color.swatch ||
                              color.hex ||
                              'var(--color-swatch-fallback)',
                          }}
                          onClick={() => selectFinish(color)}
                        />
                      )
                    })}
                    <button
                      type="button"
                      className="product-page__swatch-all"
                      aria-haspopup="dialog"
                      aria-expanded={finishesOpen}
                      onClick={() => setFinishesOpen(true)}
                    >
                      Все →
                    </button>
                  </div>
                </section>
              ) : null}

              {showSpecs || showDocuments || showCare ? (
                <div
                  id="product-specs"
                  className="product-page__block product-page__accordions"
                >
                  {showSpecs ? (
                    <Accordion
                      id="specs"
                      title="Характеристики"
                      open={openAcc === 'specs'}
                      onToggle={() => toggleAcc('specs')}
                      demoLabel={demoLabel}
                    >
                      <dl className="product-page__specs">
                        {specEntries.map(([key, value]) => (
                          <div key={key}>
                            <dt>{key}</dt>
                            <dd>{value}</dd>
                          </div>
                        ))}
                      </dl>
                    </Accordion>
                  ) : null}
                  {showDocuments ? (
                    <Accordion
                      id="docs"
                      title="Документы"
                      open={openAcc === 'docs'}
                      onToggle={() => toggleAcc('docs')}
                    >
                      <ul className="product-page__docs">
                        {documents.map((doc, index) => (
                          <li key={`${doc.title}-${index}`}>
                            <span className="product-page__doc-title">
                              {doc.title}
                            </span>
                            <span className="product-page__doc-actions">
                              <span className="product-page__doc-format">
                                {doc.format}
                              </span>
                              <a
                                className="product-page__doc-link"
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={stayOnPage(doc.url)}
                              >
                                Открыть
                              </a>
                              <a
                                className="product-page__doc-link"
                                href={doc.url}
                                download
                                onClick={stayOnPage(doc.url)}
                              >
                                Скачать
                              </a>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Accordion>
                  ) : null}
                  {showCare ? (
                    <Accordion
                      id="care"
                      title="Уход"
                      open={openAcc === 'care'}
                      onToggle={() => toggleAcc('care')}
                    >
                      <p className="product-page__care">{careText}</p>
                    </Accordion>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </Reveal>

        {relatedBlocks.map((block) => (
          <Reveal
            key={block.id}
            as="section"
            className="product-related"
            aria-labelledby={`related-${block.id}`}
          >
            <div className="product-related__head">
              <div className="product-related__titlebar">
                <SectionLabel id={`related-${block.id}`}>
                  {block.title}
                </SectionLabel>
                <Link className="product-related__link" to={block.linkHref}>
                  <span>{block.linkLabel}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="product-related__grid">
              {block.items.map((item) => (
                <ProductCard key={item.slug} item={item} />
              ))}
            </div>
          </Reveal>
        ))}
      </div>

      <FinishesDrawer
        open={finishesOpen}
        onClose={closeFinishes}
        groups={finishGroups}
        activeColorId={activeColor?.id || null}
        onSelect={selectFinish}
        demoLabel={demoLabel}
      />
    </SiteShell>
  )
}
