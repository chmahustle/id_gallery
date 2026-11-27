import { useState } from 'react'
import { brands } from '../data/brands'
import { interiors } from '../data/interiors'
import { products } from '../data/products'
import { getBrandFeatured } from '../lib/brandShowcase'
import { getBrandInteriors } from '../lib/interiors'
import { explainError, uploadAdminFile } from './adminUpload'
import AdminBrandAuthors from './AdminBrandAuthors'
import { saveBrandField } from './adminBrandStore'
import { type AdminMessage, moved } from './adminListStore'
import type { BrandCatalog } from '../types'
import { AdminIconButton } from './AdminIconButton'

const FEATURED_LIMIT = 8

/** Строка списка: превью, название, порядок и удаление */
type RowProps = {
  image?: string
  title: string
  meta?: string
  index: number
  total: number
  busy: boolean
  onMove: (delta: number) => void
  onRemove: () => void
  removeLabel?: string
}

function Row({
  image,
  title,
  meta,
  index,
  total,
  busy,
  onMove,
  onRemove,
  removeLabel = 'Убрать',
}: RowProps) {
  return (
    <li className="admin-pick__row">
      {image ? <img src={image} alt="" /> : <span className="admin-pick__noimg" />}
      <span className="admin-pick__name">
        <strong>{title}</strong>
        {meta ? <span>{meta}</span> : null}
      </span>
      <span className="admin-pick__tools">
        <button
          type="button"
          disabled={busy || index === 0}
          aria-label="Выше"
          onClick={() => onMove(-1)}
        >
          ↑
        </button>
        <button
          type="button"
          disabled={busy || index === total - 1}
          aria-label="Ниже"
          onClick={() => onMove(1)}
        >
          ↓
        </button>
        <AdminIconButton
          icon="delete"
          size="sm"
          disabled={busy}
          label={removeLabel}
          onClick={onRemove}
        />
      </span>
    </li>
  )
}

/**
 * Страница бренда в конструкторе: что показывать в «Подборке товаров»,
 * «Интерьерах» и «Каталогах». Выбор — из товаров и интерьеров бренда;
 * всё сохраняется в карточку бренда (вкладка «Бренды»).
 */
/** Что выбирать на странице бренда */
export type BrandPageKind = 'featured' | 'interiors' | 'catalogs' | 'authors'

export default function AdminBrandPagePicker({
  brandSlug,
  kind,
  onMessage,
  onChanged,
}: {
  brandSlug: string
  kind: BrandPageKind | string
  onMessage: (message: AdminMessage) => void
  onChanged: () => void
}) {
  const brand = brands.find((item) => item.slug === brandSlug)
  const [busy, setBusy] = useState(false)
  const [, setRev] = useState(0)
  const [addValue, setAddValue] = useState('')
  const [catalog, setCatalog] = useState({ title: '', edition: '', cover: '', url: '' })

  if (!brand) return null

  /* авторы — свой редактор: фото, ФИО, текст, модели */
  if (kind === 'authors') {
    return <AdminBrandAuthors brandSlug={brandSlug} onMessage={onMessage} onChanged={onChanged} />
  }

  async function store(key: string, value: unknown, message: string) {
    setBusy(true)
    try {
      await saveBrandField(brandSlug, key, value)
      setRev((n) => n + 1)
      onChanged()
      onMessage({ ok: message })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить') })
    } finally {
      setBusy(false)
    }
  }

  /* —— Подборка товаров —— */
  if (kind === 'featured') {
    const mine = products.filter((item) => item.brandSlug === brandSlug)
    const bySlug = new Map(mine.map((item) => [item.slug, item]))
    const isAuto = !brand.featuredSlugs?.length
    const current: string[] = isAuto
      ? getBrandFeatured(brandSlug, FEATURED_LIMIT).map((item) => item.slug)
      : brand.featuredSlugs || []
    const rest = mine.filter((item) => !current.includes(item.slug))
    const save = (list: string[]) =>
      store('featuredSlugs', list.length ? list : undefined, 'Подборка товаров сохранена')
    return (
      <section className="admin-field admin-pick">
        <h3>Товары в подборке</h3>
        <p className="admin-field__hint">
          {`Товары ${brand.name}, до ${FEATURED_LIMIT}. ${isAuto ? 'Сейчас подобраны автоматически — любое изменение закрепит список.' : ''}`}
        </p>
        <ol className="admin-pick__list">
          {current.map((slug, index) => {
            const product = bySlug.get(slug)
            return (
              <Row
                key={slug}
                image={product?.image}
                title={product?.name || `Нет товара «${slug}»`}
                meta={product?.category}
                index={index}
                total={current.length}
                busy={busy}
                onMove={(delta) => void save(moved(current, index, delta))}
                onRemove={() => void save(current.filter((item) => item !== slug))}
              />
            )
          })}
        </ol>
        {rest.length && current.length < FEATURED_LIMIT ? (
          <div className="admin-pick__add">
            <select
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              aria-label="Товар бренда"
            >
              <option value="">{`Добавить товар ${brand.name}…`}</option>
              {rest.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {`${item.name} · ${item.category}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="admin-field__save"
              disabled={busy || !addValue}
              onClick={() => {
                const slug = addValue
                setAddValue('')
                void save([...current, slug])
              }}
            >
              Добавить
            </button>
          </div>
        ) : null}
        {!isAuto ? (
          <button
            type="button"
            className="admin-field__link"
            disabled={busy}
            onClick={() => void save([])}
          >
            Вернуть автоматический выбор
          </button>
        ) : null}
      </section>
    )
  }

  /* —— Интерьеры —— */
  if (kind === 'interiors') {
    const bySlug = new Map(interiors.map((item) => [item.slug, item]))
    const isAuto = !brand.interiorSlugs?.length
    const current = getBrandInteriors(brandSlug, brand.interiorSlugs).map((item) => item.slug)
    const rest = interiors.filter((item) => !current.includes(item.slug))
    const save = (list: string[]) =>
      store('interiorSlugs', list.length ? list : undefined, 'Интерьеры бренда сохранены')
    return (
      <section className="admin-field admin-pick">
        <h3>Интерьеры на странице бренда</h3>
        {isAuto ? (
          <p className="admin-field__hint">
            Сейчас — все интерьеры, где отмечен бренд. Любое изменение закрепит список.
          </p>
        ) : null}
        <ol className="admin-pick__list">
          {current.map((slug, index) => {
            const item = bySlug.get(slug)
            return (
              <Row
                key={slug}
                image={item?.image}
                title={item?.title || slug}
                index={index}
                total={current.length}
                busy={busy}
                onMove={(delta) => void save(moved(current, index, delta))}
                onRemove={() => void save(current.filter((s) => s !== slug))}
              />
            )
          })}
        </ol>
        {rest.length ? (
          <div className="admin-pick__add">
            <select
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              aria-label="Интерьер"
            >
              <option value="">Добавить интерьер…</option>
              {rest.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="admin-field__save"
              disabled={busy || !addValue}
              onClick={() => {
                const slug = addValue
                setAddValue('')
                void save([...current, slug])
              }}
            >
              Добавить
            </button>
          </div>
        ) : null}
        {!isAuto ? (
          <button
            type="button"
            className="admin-field__link"
            disabled={busy}
            onClick={() => void save([])}
          >
            Вернуть автоматический выбор
          </button>
        ) : null}
      </section>
    )
  }

  /* —— Каталоги —— */
  if (kind === 'catalogs') {
    const list: BrandCatalog[] = brand.catalogs || []
    const save = (next: BrandCatalog[]) => store('catalogs', next, 'Каталоги бренда сохранены')
    async function uploadTo(file: File, key: 'cover' | 'url') {
      setBusy(true)
      try {
        const url = await uploadAdminFile(file)
        setCatalog((prev) => ({ ...prev, [key]: url }))
      } catch (err) {
        onMessage({ error: explainError(err, 'Не удалось загрузить файл') })
      } finally {
        setBusy(false)
      }
    }
    return (
      <section className="admin-field admin-pick">
        <h3>Каталоги</h3>
        <ol className="admin-pick__list">
          {list.map((item, index) => (
            <Row
              key={`${item.title}-${index}`}
              image={item.cover}
              title={item.title}
              meta={[item.edition, item.format].filter(Boolean).join(' · ')}
              index={index}
              total={list.length}
              busy={busy}
              onMove={(delta) => void save(moved(list, index, delta))}
              onRemove={() => void save(list.filter((_, i) => i !== index))}
            />
          ))}
          {list.length === 0 ? (
            <li className="admin-pick__empty">Каталогов пока нет — блок на сайте скрыт</li>
          ) : null}
        </ol>
        <form
          className="admin-pick__custom"
          onSubmit={(e) => {
            e.preventDefault()
            if (!catalog.title.trim() || !catalog.url) {
              onMessage({ error: 'Нужны название каталога и файл' })
              return
            }
            void save([
              ...list,
              {
                title: catalog.title.trim(),
                ...(catalog.edition.trim() ? { edition: catalog.edition.trim() } : {}),
                format: /\.pdf$/i.test(catalog.url) ? 'PDF' : 'Файл',
                url: catalog.url,
                ...(catalog.cover ? { cover: catalog.cover } : {}),
              },
            ])
            setCatalog({ title: '', edition: '', cover: '', url: '' })
          }}
        >
          <span className="admin-field__hint">Новый каталог:</span>
          <input
            type="text"
            placeholder="Название (семейство, не год)"
            value={catalog.title}
            onChange={(e) => setCatalog((prev) => ({ ...prev, title: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Выпуск, например 2026"
            value={catalog.edition}
            onChange={(e) => setCatalog((prev) => ({ ...prev, edition: e.target.value }))}
          />
          <div className="admin-pick__files">
            <label className="admin-field__upload">
              {catalog.cover ? 'Обложка ✓' : 'Обложка'}
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) void uploadTo(file, 'cover')
                }}
              />
            </label>
            <label className="admin-field__upload">
              {catalog.url ? 'Файл ✓' : 'Файл PDF'}
              <input
                type="file"
                accept="application/pdf"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) void uploadTo(file, 'url')
                }}
              />
            </label>
            <button type="submit" className="admin-field__save" disabled={busy}>
              Добавить каталог
            </button>
          </div>
        </form>
      </section>
    )
  }

  return null
}
