import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { brands } from '../data/brands'
import { categories } from '../data/categories'
import { applyAdminProducts, codeProducts } from '../data/productsRuntime'
import { rooms } from '../data/rooms'
import { explainError, uploadAdminFile } from './adminUpload'
import {
  ProductDocuments,
  ProductMaterials,
  ProductPhotos,
  ProductVariants,
} from './AdminProductSections'
import './AdminEditor.css'
import { slugify as toSlug } from './adminSlug'

/**
 * «Товары»: товары из кода и из админки в одном списке.
 * Правка товара из кода сохраняет его копию в базе (она важнее кода);
 * «Удалить из админки» возвращает версию из кода или удаляет новый товар.
 */

const slugify = (text) => toSlug(text, { max: 100 })

const SPEC_KEYS = [
  ['dimensions', 'Размеры'],
  ['materials', 'Материалы'],
  ['finishes', 'Отделки'],
  ['sku', 'Артикул'],
]

/** Товар → форма редактора */
function toForm(product) {
  const chars = product?.characteristics || {}
  return {
    slug: product?.slug || '',
    name: product?.name || '',
    brandSlug: product?.brandSlug || brands[0]?.slug || '',
    categorySlug: product?.categorySlug || categories[0]?.slug || '',
    summary: product?.summary || '',
    shortDescription: product?.shortDescription || '',
    images: [...(product?.images || (product?.image ? [product.image] : []))],
    variants: (product?.variants || product?.colors || []).map((item) => ({
      id: item.id,
      name: item.name || '',
      swatch: item.swatch || '',
      images: item.images?.length ? [...item.images] : item.image ? [item.image] : [],
      dimensions: {
        value: item.dimensions?.value || '',
        approved: item.dimensions?.status === 'approved',
      },
      materials: {
        value: item.materials?.value || '',
        approved: item.materials?.status === 'approved',
      },
    })),
    materialSwatches: (product?.materialSwatches || []).map((item) => ({
      name: item.name || '',
      image: item.image || '',
      note: item.note || '',
    })),
    specs: Object.fromEntries(
      SPEC_KEYS.map(([key]) => [
        key,
        { value: chars[key]?.value || '', approved: chars[key]?.status === 'approved' },
      ]),
    ),
    rooms: [...(product?.rooms || [])],
    collection: product?.collection || '',
    price: product?.price || '',
    author: product?.author?.name || '',
    documents: (product?.documents || []).map((doc) => ({ ...doc })),
    care: product?.care || '',
  }
}

/** Форма → данные товара для базы */
function fromForm(form) {
  const brand = brands.find((item) => item.slug === form.brandSlug)
  const category = categories.find((item) => item.slug === form.categorySlug)
  const characteristics = {}
  for (const [key] of SPEC_KEYS) {
    const spec = form.specs[key]
    if (spec?.value.trim()) {
      characteristics[key] = {
        value: spec.value.trim(),
        status: spec.approved ? 'approved' : 'placeholder',
      }
    }
  }
  const images = form.images.filter(Boolean)
  return {
    name: form.name.trim(),
    brand: brand?.name || form.brandSlug,
    brandSlug: form.brandSlug,
    category: category?.label || form.categorySlug,
    categorySlug: form.categorySlug,
    subcategory: category?.singular || category?.label || '',
    summary: form.summary.trim(),
    shortDescription: form.shortDescription.trim(),
    images,
    image: images[0] || '',
    variants: form.variants
      .filter((item) => item.name.trim())
      .map((item, i) => {
        const images = item.images.filter(Boolean)
        const field = (spec) =>
          spec.value.trim()
            ? { value: spec.value.trim(), status: spec.approved ? 'approved' : 'placeholder' }
            : undefined
        return {
          id: item.id || `v${i + 1}-${slugify(item.name)}`,
          name: item.name.trim(),
          ...(item.swatch ? { swatch: item.swatch } : {}),
          ...(images.length ? { image: images[0], images } : {}),
          ...(field(item.dimensions) ? { dimensions: field(item.dimensions) } : {}),
          ...(field(item.materials) ? { materials: field(item.materials) } : {}),
          status: 'approved',
        }
      }),
    materialSwatches: form.materialSwatches
      .filter((item) => item.name.trim())
      .map((item) => ({
        name: item.name.trim(),
        ...(item.image ? { image: item.image } : {}),
        ...(item.note.trim() ? { note: item.note.trim() } : {}),
      })),
    characteristics,
    rooms: form.rooms,
    ...(form.collection.trim() ? { collection: form.collection.trim() } : {}),
    ...(form.price.trim() ? { price: form.price.trim() } : {}),
    ...(form.author.trim()
      ? { author: { name: form.author.trim(), slug: slugify(form.author) } }
      : {}),
    documents: form.documents
      .filter((doc) => doc.title.trim() && doc.url)
      .map((doc) => ({ title: doc.title.trim(), url: doc.url, format: doc.format || 'PDF' })),
    care: form.care.trim(),
  }
}

/**
 * intent — переход из карточки бренда: { type: 'new', brandSlug } — новый
 * товар этого бренда, { type: 'edit', slug } — открыть товар.
 */
export default function AdminProducts({ onMessage, intent, onIntentDone }) {
  const [records, setRecords] = useState([])
  const [ready, setReady] = useState(false)
  const [query, setQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [editing, setEditing] = useState(null) // { isNew, form, published }
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async () => {
    const data = await api('/api/products')
    setRecords(data.items || [])
    applyAdminProducts(data.items || [])
  }, [])

  useEffect(() => {
    reload()
      .catch((err) => onMessage({ error: explainError(err, 'Ошибка сервера') }))
      .finally(() => setReady(true))
  }, [reload, onMessage])

  /* общий список: код + база */
  const rows = useMemo(() => {
    const bySlug = new Map(records.map((item) => [item.slug, item]))
    const list = codeProducts.map((product) => {
      const record = bySlug.get(product.slug)
      return {
        slug: product.slug,
        product: record ? { ...product, ...record.data } : product,
        source: record ? 'changed' : 'code',
        published: record ? record.published : true,
      }
    })
    const codeSlugs = new Set(codeProducts.map((item) => item.slug))
    const added = records
      .filter((record) => !codeSlugs.has(record.slug))
      .map((record) => ({
        slug: record.slug,
        product: { slug: record.slug, ...record.data },
        source: 'admin',
        published: record.published,
      }))
    return [...added, ...list]
  }, [records])

  const needle = query.trim().toLowerCase()
  const visible = rows.filter(({ product }) => {
    if (brandFilter && product.brandSlug !== brandFilter) return false
    if (!needle) return true
    return `${product.name} ${product.brand} ${product.slug}`.toLowerCase().includes(needle)
  })

  /* ссылка на товар — для блоков с подборкой товаров (например «По комнатам») */
  const [copied, setCopied] = useState('')

  async function copyLink(slug) {
    const url = `${window.location.origin}/product/${slug}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(slug)
      window.setTimeout(() => setCopied((current) => (current === slug ? '' : current)), 2000)
    } catch {
      window.prompt('Скопируйте ссылку:', url)
    }
  }

  function startNew(brandSlug = '') {
    const form = toForm(null)
    if (brandSlug) form.brandSlug = brandSlug
    setEditing({ isNew: true, form, published: true })
  }

  /* переход из карточки бренда: открыть товар или начать новый товар бренда */
  useEffect(() => {
    if (!ready || !intent) return
    if (intent.type === 'new') startNew(intent.brandSlug)
    if (intent.type === 'edit') {
      const row = rows.find((item) => item.slug === intent.slug)
      if (row) startEdit(row)
    }
    onIntentDone?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- один раз на каждый переход
  }, [ready, intent])

  function startEdit(row) {
    setEditing({
      isNew: false,
      form: toForm(row.product),
      published: row.published,
      source: row.source,
    })
  }

  function patch(update) {
    setEditing((prev) => ({ ...prev, form: { ...prev.form, ...update } }))
  }

  async function save() {
    const { form, isNew, published } = editing
    const slug = isNew ? form.slug || slugify(`${form.brandSlug}-${form.name}`) : form.slug
    if (!form.name.trim()) {
      onMessage({ error: 'Укажите название товара' })
      return
    }
    if (isNew && rows.some((row) => row.slug === slug)) {
      onMessage({ error: `Товар с адресом «${slug}» уже есть — измените адрес` })
      return
    }
    setBusy(true)
    try {
      await api(`/api/products/${encodeURIComponent(slug)}`, {
        method: 'PUT',
        body: JSON.stringify({ data: fromForm(form), published }),
      })
      await reload()
      setEditing(null)
      onMessage({ ok: `Товар сохранён: ${form.name}` })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить товар') })
    } finally {
      setBusy(false)
    }
  }

  async function removeRecord(row) {
    const text =
      row.source === 'admin'
        ? `Удалить товар «${row.product.name}»?`
        : `Вернуть товар «${row.product.name}» к версии из кода?`
    if (!window.confirm(text)) return
    setBusy(true)
    try {
      await api(`/api/products/${encodeURIComponent(row.slug)}`, { method: 'DELETE' })
      await reload()
      setEditing(null)
      onMessage({ ok: row.source === 'admin' ? 'Товар удалён' : 'Возвращена версия из кода' })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось удалить') })
    } finally {
      setBusy(false)
    }
  }

  async function uploadTo(file, onUrl) {
    setBusy(true)
    try {
      onUrl(await uploadAdminFile(file))
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось загрузить файл') })
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return <p className="admin__loading">Загрузка товаров…</p>

  if (editing) {
    const { form } = editing
    const row = rows.find((item) => item.slug === form.slug)
    /* общие свойства блоков формы, вынесенных в AdminProductSections */
    const sectionProps = { form, patch, setEditing, busy, uploadTo }
    return (
      <div className="admin-product">
        <div className="admin-product__bar">
          <button type="button" className="admin__ghost" onClick={() => setEditing(null)}>
            ← К списку
          </button>
          <h2>{editing.isNew ? 'Новый товар' : form.name || form.slug}</h2>
          {!editing.isNew ? (
            <button type="button" className="admin__ghost" onClick={() => void copyLink(form.slug)}>
              {copied === form.slug ? 'Скопировано' : 'Скопировать ссылку'}
            </button>
          ) : null}
        </div>

        <section className="admin-field">
          <h3>Основное</h3>
          <div className="admin-grid">
            <label>
              Название
              <input value={form.name} onChange={(e) => patch({ name: e.target.value })} />
            </label>
            <label>
              Адрес страницы (латиницей)
              <input
                value={editing.isNew ? form.slug : form.slug}
                placeholder={slugify(`${form.brandSlug}-${form.name}`)}
                disabled={!editing.isNew}
                onChange={(e) => patch({ slug: slugify(e.target.value) })}
              />
            </label>
            <label>
              Бренд
              <select value={form.brandSlug} onChange={(e) => patch({ brandSlug: e.target.value })}>
                {brands.map((brand) => (
                  <option key={brand.slug} value={brand.slug}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Тип
              <select
                value={form.categorySlug}
                onChange={(e) => patch({ categorySlug: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Коллекция
              <input
                list="admin-collections"
                value={form.collection}
                placeholder="из коллекций бренда или своя"
                onChange={(e) => patch({ collection: e.target.value })}
              />
              <datalist id="admin-collections">
                {(brands.find((brand) => brand.slug === form.brandSlug)?.collections || []).map(
                  (item) => (
                    <option key={item.title} value={item.title} />
                  ),
                )}
              </datalist>
            </label>
            <label>
              Цена
              <input
                value={form.price}
                placeholder="например, по запросу или 1 200 000 ₸"
                onChange={(e) => patch({ price: e.target.value })}
              />
              <span className="admin-field__hint">
                Хранится в карточке; на сайте цены пока не показываются.
              </span>
            </label>
            <label>
              Автор (дизайнер)
              <input value={form.author} onChange={(e) => patch({ author: e.target.value })} />
            </label>
          </div>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={editing.published}
              onChange={(e) => setEditing((prev) => ({ ...prev, published: e.target.checked }))}
            />
            Показывать на сайте
          </label>
        </section>

        <section className="admin-field">
          <h3>Описание</h3>
          <label>
            Кратко под названием (1–3 строки)
            <textarea
              rows={2}
              value={form.summary}
              onChange={(e) => patch({ summary: e.target.value })}
            />
          </label>
          <label>
            Подробное описание
            <textarea
              rows={4}
              value={form.shortDescription}
              onChange={(e) => patch({ shortDescription: e.target.value })}
            />
          </label>
          <label>
            Уход
            <textarea
              rows={3}
              value={form.care}
              onChange={(e) => patch({ care: e.target.value })}
            />
          </label>
        </section>

        <ProductPhotos {...sectionProps} />

        <ProductVariants {...sectionProps} />

        <ProductMaterials {...sectionProps} />

        <section className="admin-field">
          <h3>Характеристики</h3>
          <p className="admin-field__hint">
            Таблица характеристик текстом. На сайте — только подтверждённые значения. Если у цвета
            свои размеры, укажите их в «Цвета и исполнения» — при выборе цвета они заменят общие.
          </p>
          {SPEC_KEYS.map(([key, label]) => (
            <div key={key} className="admin-spec">
              <label>
                {label}
                <input
                  value={form.specs[key].value}
                  onChange={(e) =>
                    patch({
                      specs: {
                        ...form.specs,
                        [key]: { ...form.specs[key], value: e.target.value },
                      },
                    })
                  }
                />
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={form.specs[key].approved}
                  onChange={(e) =>
                    patch({
                      specs: {
                        ...form.specs,
                        [key]: { ...form.specs[key], approved: e.target.checked },
                      },
                    })
                  }
                />
                подтверждено
              </label>
            </div>
          ))}
        </section>

        <section className="admin-field">
          <h3>Комнаты</h3>
          <p className="admin-field__hint">
            Если не отмечено — комнаты подбираются по типу товара.
          </p>
          <div className="admin-checks">
            {rooms.map((room) => (
              <label key={room.slug} className="admin-check">
                <input
                  type="checkbox"
                  checked={form.rooms.includes(room.slug)}
                  onChange={(e) =>
                    patch({
                      rooms: e.target.checked
                        ? [...form.rooms, room.slug]
                        : form.rooms.filter((slug) => slug !== room.slug),
                    })
                  }
                />
                {room.label}
              </label>
            ))}
          </div>
        </section>

        <ProductDocuments {...sectionProps} />

        <div className="admin-product__save">
          <button type="button" disabled={busy} onClick={() => void save()}>
            {busy ? 'Сохранение…' : 'Сохранить товар'}
          </button>
          {row && row.source !== 'code' ? (
            <button
              type="button"
              className="admin__danger"
              disabled={busy}
              onClick={() => void removeRecord(row)}
            >
              {row.source === 'admin' ? 'Удалить товар' : 'Вернуть версию из кода'}
            </button>
          ) : null}
          {!editing.isNew ? (
            <a href={`/product/${form.slug}`} target="_blank" rel="noopener noreferrer">
              Открыть на сайте ↗
            </a>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-products">
      <div className="admin__toolbar">
        <button type="button" onClick={() => startNew()}>
          + Добавить товар
        </button>
        <input
          type="search"
          placeholder="Поиск по названию"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
          <option value="">Все бренды</option>
          {brands.map((brand) => (
            <option key={brand.slug} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
        <span className="admin__dirty">{`Товаров: ${visible.length}`}</span>
      </div>

      <ul className="admin-products__list">
        {visible.map((row) => (
          <li key={row.slug}>
            <button type="button" className="admin-products__row" onClick={() => startEdit(row)}>
              {row.product.image || row.product.images?.[0] ? (
                <img src={row.product.images?.[0] || row.product.image} alt="" />
              ) : (
                <span className="admin-products__noimg" />
              )}
              <span className="admin-products__name">
                <strong>{row.product.name}</strong>
                <span>{`${row.product.brand} · ${row.product.category}`}</span>
              </span>
              <span className="admin-products__tags">
                {row.source === 'admin' ? <em>новый</em> : null}
                {row.source === 'changed' ? <em>изменён</em> : null}
                {row.product.demo && row.source === 'code' ? (
                  <em className="is-muted">демо</em>
                ) : null}
                {!row.published ? <em className="is-hidden">скрыт</em> : null}
              </span>
            </button>
            <button
              type="button"
              className="admin-products__copy"
              title="Ссылку можно вставить в блок «По комнатам» на главной"
              onClick={() => void copyLink(row.slug)}
            >
              {copied === row.slug ? 'Скопировано' : 'Скопировать ссылку'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
