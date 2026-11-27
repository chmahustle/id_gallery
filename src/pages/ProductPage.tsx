import { ArrowLeft, ArrowRight, ChevronDown, X } from 'lucide-react'
import { type MouseEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { catalogPath, getProductBySlug, getRelatedProducts } from '../catalog/catalog'
import { type FinishGroup, getProductFinishGroups } from '../catalog/finishes'
import { ProductCard } from '../components/catalog/ProductCard'
import { Placeholder } from '../components/Placeholder'
import SiteShell from '../components/SiteShell'
import { Button, Reveal, SectionLabel } from '../components/ui'
import { useUserAuth } from '../auth/UserAuthContext'
import { useCart } from '../cart/CartContext'
import { useSelection } from '../selection/SelectionContext'
import { useCompare } from '../compare/CompareContext'
import { canCompare, confirmedValue } from '../compare/comparable'
import { categories } from '../data/categories'
import { featureFlags } from '../data/featureFlags'
import { CropImage } from '../features/brands/CropImage'
import {
  getApprovedSpecs,
  getPlaceholderSpecs,
  getProducts as getAllProducts,
  resolveBrandName,
} from '../lib/catalog'
import { resolveProductDevPreview } from './productDevPreview'
import { getPreviousLocation, readFinish, saveFinish } from '../lib/navHistory'
import { getProductRooms, getRoomBySlug, getRoomProducts } from '../lib/rooms'
import { buildGalleryFrames, type GalleryFrame } from './productGalleryFrames'
import { swatchBackground } from '../lib/swatch'
import type { Product, ProductVariant } from '../types'
import './ProductPage.css'

const PREVIEW_SWATCH_LIMIT = 4
const RELATED_MIN = 2
const RELATED_LIMIT = 4
/** Заглушка «#» не должна уводить со страницы */
const stayOnPage = (url: string) => (event: MouseEvent<HTMLAnchorElement>) => {
  if (url === '#') event.preventDefault()
}

function DemoBadge({ label }: { label?: string }) {
  if (!label) return null
  return <span className="product-page__demo-badge">{label}</span>
}

type ProductGalleryProps = {
  frames: GalleryFrame[]
  name: string
  brand: string
  demoLabel?: string
}

function ProductGallery({ frames, name, brand, demoLabel }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [fadeKey, setFadeKey] = useState(0)
  const current = frames[activeIndex] || frames[0]

  useEffect(() => {
    setActiveIndex(0)
    setFadeKey((k) => k + 1)
  }, [frames])

  function selectFrame(index: number) {
    if (index === activeIndex) return
    setActiveIndex(index)
    setFadeKey((k) => k + 1)
  }

  if (!current) {
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

type AccordionProps = {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
  demoLabel?: string
}

function Accordion({ id, title, open, onToggle, children, demoLabel }: AccordionProps) {
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

type FinishesDrawerProps = {
  open: boolean
  onClose: () => void
  groups: FinishGroup[]
  activeColorId: string | null
  onSelect: (color: { id: string }) => void
  demoLabel?: string
}

function FinishesDrawer({
  open,
  onClose,
  groups,
  activeColorId,
  onSelect,
  demoLabel,
}: FinishesDrawerProps) {
  useEffect(() => {
    if (!open) return undefined

    const onKey = (event: KeyboardEvent) => {
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
                  <div className="finishes-drawer__grid" role="listbox" aria-label={material.name}>
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
                            style={{ background: swatchBackground(color) }}
                          />
                          <span className="finishes-drawer__name">{color.name}</span>
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
  const { productSlug = '' } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const baseProduct = getProductBySlug(productSlug)
  const { addItem } = useCart()
  const { user } = useUserAuth()
  const selection = useSelection()
  const compare = useCompare()
  /* сообщение после «Сравнить»: другой тип / набор полон */
  const [compareNote, setCompareNote] = useState('')
  const [openAcc, setOpenAcc] = useState('specs')
  const [activeColorId, setActiveColorId] = useState<string | null>(null)
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
    /* выбранное исполнение помнится в рамках сессии */
    setActiveColorId(readFinish(productSlug))
    setFinishesOpen(false)
    setCompareNote('')
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
    const pick = (list: Product[]) => {
      const images = new Set<string>()
      const result: Product[] = []
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
    type RelatedBlock = { id: string; title: string; linkLabel: string; linkHref: string }
    const blocks: (RelatedBlock & { items: Product[] })[] = []
    const add = (block: RelatedBlock, items: Product[]) => {
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

  const productColors = useMemo(
    (): ProductVariant[] =>
      Array.isArray(product?.colors) ? product.colors : product?.variants || [],
    [product],
  )
  const finishGroups = useMemo(() => getProductFinishGroups(productColors), [productColors])
  const previewColors = productColors.slice(0, PREVIEW_SWATCH_LIMIT)
  const hasApprovedFinishes = productColors.some((color) => color.status === 'approved')
  const showFinishes = (hasApprovedFinishes || showPh) && productColors.length > 0

  /* исполнение целиком — с его фото, размерами и материалами */
  const activeColor =
    productColors.find((color) => color.id === activeColorId) || productColors[0] || null

  const closeFinishes = useCallback(() => setFinishesOpen(false), [])

  /* галерея: у выбранного исполнения — сначала его фото */
  const pickedFinish = activeColorId ? activeColor : null
  const galleryFrames = useMemo(
    () => (product ? buildGalleryFrames(product, pickedFinish) : []),
    [product, pickedFinish],
  )

  function selectFinish(color: { id: string }) {
    setActiveColorId(color.id)
    saveFinish(productSlug, color.id)
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
  const baseSpecs = showRealSpecs ? approvedSpecs : showPlaceholderSpecs ? placeholderSpecs : []
  /* размеры и материалы — по выбранному исполнению, если они у него подтверждены */
  const chosenFinish = activeColorId && activeColor?.id === activeColorId ? activeColor : null
  const finishSpecs = (
    [
      ['Размеры', confirmedValue(chosenFinish?.dimensions)],
      ['Материалы', confirmedValue(chosenFinish?.materials)],
    ] as [string, string][]
  ).filter(([, value]) => Boolean(value))
  const specEntries = finishSpecs.length
    ? [
        ...finishSpecs,
        ...baseSpecs.filter(([key]) => !finishSpecs.some(([label]) => label === key)),
      ]
    : baseSpecs
  const specsForFinish = finishSpecs.length ? chosenFinish?.name || '' : ''
  /* материалы с образцами из админки — квадраты-данные, не кнопки */
  const materialSwatches = (product.materialSwatches || []).filter((item) => item.name)
  const showSpecs = specEntries.length > 0 || materialSwatches.length > 0

  const documents = (product.documents || []).filter((doc) => doc.title && doc.url)
  const showDocuments = documents.length > 0
  const careText = (product.care || '').trim()
  const showCare = Boolean(careText)

  /* в заявку, визит и подборку уходят модель и выбранное исполнение */
  const variantParam =
    activeColorId && activeColor?.id === activeColorId
      ? `&variant=${encodeURIComponent(activeColor.id)}`
      : ''
  const modelParam = `model=${encodeURIComponent(product.slug)}${variantParam}`
  const savedVariantId = activeColorId && activeColor?.id === activeColorId ? activeColor.id : ''
  const requestHref = `/request/?type=offer&${modelParam}`
  const visitHref = `/request/?type=visit&${modelParam}`
  /* гость: «Сохранить в подборку» ведёт ко входу или регистрации с моделью */
  const saveHref = `/account?tab=login&${modelParam}`
  const typeLabel =
    categories.find((item) => item.slug === product.categorySlug)?.singular ||
    product.subcategory ||
    product.category

  /* «Назад к результатам» — только если пришли со списка внутри сайта */
  const previousPage = getPreviousLocation()
  const cameFromList =
    location.key !== 'default' &&
    previousPage &&
    /^\/(catalog|brands|interiors|rooms)(\/|$)/.test(previousPage.pathname)

  function toggleAcc(id: string) {
    setOpenAcc((current) => (current === id ? '' : id))
  }

  return (
    <SiteShell variant="solid">
      <div className="product-page">
        {cameFromList && previousPage ? (
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
              <Link className="product-page__title-brand" to={`/brands/${product.brandSlug}`}>
                {brandName}
              </Link>
              <span className="product-page__title-sep" aria-hidden="true">
                {' '}
                ·{' '}
              </span>
              {product.name}
            </h1>

            {typeLabel ? <p className="product-page__type">{typeLabel}</p> : null}

            {product.author?.name ? (
              <p className="product-page__author">
                Автор: {/* TODO: когда появится фильтр каталога по автору — вести на него */}
                <Link to={`/catalog?brand=${encodeURIComponent(product.brandSlug)}`}>
                  {product.author.name}
                </Link>
              </p>
            ) : null}

            {showSummary ? <p className="product-page__summary">{summaryText}</p> : null}

            <div className="product-page__stack">
              <div className="product-page__actions">
                <Button as={Link} variant="primary" to={requestHref}>
                  Узнать стоимость
                </Button>
                {user ? (
                  /* повторное сохранение не создаёт дубль: уже сохранено — ссылка в подборку */
                  selection.has(product.slug, savedVariantId) ? (
                    <Button as={Link} variant="secondary" withArrow to="/account">
                      В подборке
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => selection.save(product.slug, savedVariantId)}
                    >
                      Сохранить в подборку
                    </Button>
                  )
                ) : (
                  <Button as={Link} variant="secondary" to={saveHref}>
                    Сохранить в подборку
                  </Button>
                )}
                <Link className="product-page__visit" to={visitHref}>
                  Консультация и визит
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                {canCompare(activeColorId ? activeColor : null) ? (
                  compare.has(product.slug) ? (
                    <Link className="product-page__visit" to="/compare">
                      {`В сравнении · ${compare.items.length}`}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="product-page__visit product-page__cart-add"
                      onClick={() => {
                        const result = compare.add(product, savedVariantId)
                        setCompareNote(
                          result === 'other-type'
                            ? 'Можно сравнить только модели одного типа.'
                            : result === 'full'
                              ? 'В сравнении уже 4 модели — уберите одну.'
                              : '',
                        )
                      }}
                    >
                      Сравнить
                      <ArrowRight size={16} aria-hidden="true" />
                    </button>
                  )
                ) : null}
                {compareNote ? (
                  <p className="product-page__compare-note" role="status">
                    {compareNote} <Link to="/compare">Открыть сравнение</Link>
                  </p>
                ) : null}
                {user ? (
                  <button
                    type="button"
                    className="product-page__visit product-page__cart-add"
                    onClick={() => addItem(product, activeColorId ? activeColor : null)}
                  >
                    Добавить в корзину
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
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
                    <p className="product-page__finishes-current">{activeColor.name}</p>
                  ) : null}
                  <div className="product-page__swatches" role="listbox" aria-label="Выбор образца">
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
                          style={{ background: swatchBackground(color) }}
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
                <div id="product-specs" className="product-page__block product-page__accordions">
                  {showSpecs ? (
                    <Accordion
                      id="specs"
                      title="Характеристики"
                      open={openAcc === 'specs'}
                      onToggle={() => toggleAcc('specs')}
                      demoLabel={demoLabel}
                    >
                      {materialSwatches.length ? (
                        <ul className="product-page__materials" aria-label="Материалы">
                          {materialSwatches.map((item) => (
                            <li key={item.name}>
                              <span
                                className="product-page__material-chip"
                                style={{ background: swatchBackground({ swatch: item.image }) }}
                                aria-hidden="true"
                              />
                              <span className="product-page__material-text">
                                <span>{item.name}</span>
                                {item.note ? <span>{item.note}</span> : null}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {specsForFinish ? (
                        <p className="product-page__specs-note">
                          {`Для исполнения: ${specsForFinish}`}
                        </p>
                      ) : null}
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
                            <span className="product-page__doc-title">{doc.title}</span>
                            <span className="product-page__doc-actions">
                              <span className="product-page__doc-format">{doc.format}</span>
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
                <SectionLabel id={`related-${block.id}`}>{block.title}</SectionLabel>
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
