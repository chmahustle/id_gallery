import { useState } from 'react'
import { api } from '../api'
import { brands } from '../data/brands'
import { interiors } from '../data/interiors'
import { type InteriorRecord, applyInteriorRecords, codeInteriors } from '../data/interiorsRuntime'
import { products } from '../data/products'
import { rooms } from '../data/rooms'
import { resolveBrandName } from '../lib/catalog'
import { explainError, uploadAdminFile } from './adminUpload'
import { FrameButton } from './AdminFrame'
import { FRAMES } from './adminFrames'
import { stripFrame } from '../lib/imageFrame'
import { type AdminMessage, moved, useStoredList } from './adminListStore'
import { HotspotsEditor } from './AdminHotspots'
import type { InteriorHotspot, InteriorSelection } from '../types'
import './AdminEditor.css'
import { slugify as toSlug } from './adminSlug'
import { AdminIconButton } from './AdminIconButton'

const KEY = 'interiors.records'
const codeSlugs = new Set(codeInteriors.map((item) => item.slug))

const slugify = (text: unknown) => toSlug(text, { max: 60 })

/** Форма редактора интерьера */
type InteriorForm = {
  slug: string
  title: string
  caption: string
  image: string
  room: string
  brands: string[]
  productIds: string[]
  productsConfirmed: boolean
  hotspots: InteriorHotspot[]
  published: boolean
}

type InteriorEditing = { isNew: boolean; form: InteriorForm }

/** Строка списка: интерьер на сайте или скрытый из записей */
type InteriorRow = Partial<InteriorSelection> & { slug: string; title?: string }

/** Текущий вид интерьера (с правками) → форма */
function toForm(item: InteriorRow, record: InteriorRecord | null): InteriorForm {
  return {
    slug: item.slug,
    title: item.title || '',
    caption: item.caption || '',
    image: item.image || '',
    room: item.room || '',
    brands: [...(item.brands || [])],
    productIds: [...(item.productIds || [])],
    productsConfirmed: Boolean(item.productsConfirmed),
    hotspots: (item.hotspots || []).map((spot) => ({ ...spot })),
    published: record ? record.published !== false : true,
  }
}

/**
 * «Интерьеры»: все интерьеры сайта — фото, заголовок, текст, комната,
 * бренды и товары на фото; новые интерьеры. Заголовок, текст и фото
 * интерьеров из кода — те же поля, что в конструкторе.
 */
/* где на сайте стоит фото интерьера */
const INTERIOR_FRAMES = [
  ...FRAMES.hero,
  { label: 'Карточка в списке интерьеров', ratio: 4 / 5 },
  { label: 'Фото с точками, компьютер', ratio: 16 / 8 },
]

export default function AdminInteriors({
  onMessage,
}: {
  onMessage: (message: AdminMessage) => void
}) {
  const [editing, setEditing] = useState<InteriorEditing | null>(null)
  const [busy, setBusy] = useState(false)
  const [addProduct, setAddProduct] = useState('')
  const store = useStoredList<InteriorRecord[]>(KEY, () => [], {
    onMessage,
    okText: 'Интерьер сохранён',
    onSaved: (value) => applyInteriorRecords(value || []),
  })

  if (!store.list) return <p className="admin__loading">Загрузка интерьеров…</p>
  const records = store.list
  const recordOf = (slug: string) => records.find((item) => item.slug === slug) || null

  /* список: интерьеры на сайте + скрытые */
  const rows: InteriorRow[] = [
    ...interiors,
    ...records
      .filter((record) => record.published === false && !record.deleted)
      .map((record) => ({
        ...(codeInteriors.find((i) => i.slug === record.slug) || {}),
        ...record,
      })),
  ]

  /* удалённые интерьеры из кода — их можно вернуть */
  const deleted = records.filter((record) => record.deleted)

  const productBySlug = new Map(products.map((item) => [item.slug, item]))

  function patch(update: Partial<InteriorForm>) {
    setEditing((prev) => (prev ? { ...prev, form: { ...prev.form, ...update } } : prev))
  }

  async function uploadPhoto(file: File) {
    setBusy(true)
    try {
      patch({ image: await uploadAdminFile(file) })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось загрузить фото') })
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    if (!editing) return
    const { form, isNew } = editing
    const title = form.title.trim()
    if (!title) {
      onMessage({ error: 'Укажите заголовок интерьера' })
      return
    }
    const slug = isNew ? form.slug || slugify(title) : form.slug
    if (isNew && (rows.some((row) => row.slug === slug) || !slug)) {
      onMessage({ error: `Интерьер с адресом «${slug}» уже есть — измените адрес` })
      return
    }
    const record: InteriorRecord = {
      slug,
      title,
      caption: form.caption,
      image: form.image,
      room: form.room,
      brands: form.brands,
      productIds: form.productIds,
      productsConfirmed: form.productsConfirmed,
      hotspots: form.hotspots.filter((spot) => spot.product),
      published: form.published,
    }
    setBusy(true)
    try {
      /* интерьер из кода: заголовок, текст и фото — и в поля конструктора */
      if (codeSlugs.has(slug)) {
        for (const [key, value] of [
          ['title', title] as const,
          ['caption', form.caption],
          ['image', form.image],
        ]) {
          if (!String(value).trim()) continue
          await api(`/api/content/${encodeURIComponent(`interior.${slug}.${key}`)}`, {
            method: 'PUT',
            body: JSON.stringify({ value }),
          })
        }
      }
      const next = [...records.filter((item) => item.slug !== slug), record]
      if (await store.save(next)) {
        setEditing((prev) =>
          prev ? { ...prev, isNew: false, form: { ...prev.form, slug } } : prev,
        )
      }
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить интерьер') })
    } finally {
      setBusy(false)
    }
  }

  async function removeRecord(slug: string) {
    const isCode = codeSlugs.has(slug)
    if (
      !window.confirm(
        isCode ? 'Вернуть интерьер к версии из кода?' : 'Удалить интерьер? Его страница пропадёт.',
      )
    )
      return
    /* у интерьера из кода — убрать и правки его полей в конструкторе */
    if (isCode) {
      try {
        for (const key of ['title', 'caption', 'image']) {
          await api(`/api/content/${encodeURIComponent(`interior.${slug}.${key}`)}`, {
            method: 'DELETE',
          })
        }
      } catch (err) {
        onMessage({ error: explainError(err, 'Не удалось сбросить поля') })
        return
      }
    }
    if (await store.save(records.filter((item) => item.slug !== slug))) {
      setEditing(null)
      if (isCode) window.location.reload()
    }
  }

  /**
   * Удалить интерьер со всего сайта. Интерьер из кода нельзя стереть из
   * файлов — он запоминается как удалённый и не показывается нигде.
   */
  async function deleteInterior(item: { slug: string; title?: string }) {
    if (!window.confirm(`Удалить интерьер «${item.title}»? Его страница пропадёт с сайта.`)) return
    const rest = records.filter((record) => record.slug !== item.slug)
    const next = codeSlugs.has(item.slug)
      ? [...rest, { slug: item.slug, title: item.title, published: false, deleted: true }]
      : rest
    if (await store.save(next)) setEditing(null)
  }

  /* —— Список —— */
  if (!editing) {
    return (
      <div className="admin-products">
        <div className="admin__toolbar">
          <button
            type="button"
            onClick={() =>
              setEditing({
                isNew: true,
                form: { ...toForm({ slug: '' }, null), slug: '' },
              })
            }
          >
            + Добавить интерьер
          </button>
          <span className="admin__dirty">{`Интерьеров: ${rows.length}`}</span>
          {deleted.length ? (
            <button
              type="button"
              className="admin-field__link"
              disabled={store.busy}
              onClick={() => {
                const names = deleted.map((item) => `«${item.title || item.slug}»`).join(', ')
                if (window.confirm(`Вернуть удалённые интерьеры: ${names}?`)) {
                  void store.save(records.filter((record) => !record.deleted))
                }
              }}
            >
              {`Вернуть удалённые (${deleted.length})`}
            </button>
          ) : null}
        </div>
        <ul className="admin-products__list">
          {rows.map((item) => {
            const record = recordOf(item.slug)
            const room = rooms.find((r) => r.slug === item.room)
            return (
              <li key={item.slug}>
                <button
                  type="button"
                  className="admin-products__row"
                  onClick={() => setEditing({ isNew: false, form: toForm(item, record) })}
                >
                  {item.image ? (
                    <img src={item.image} alt="" />
                  ) : (
                    <span className="admin-products__noimg" />
                  )}
                  <span className="admin-products__name">
                    <strong>{item.title}</strong>
                    <span>
                      {[
                        room?.label || 'комната не указана',
                        `товаров: ${(item.productIds || []).length}`,
                      ].join(' · ')}
                    </span>
                  </span>
                  <span className="admin-products__tags">
                    {!codeSlugs.has(item.slug) ? <em>новый</em> : null}
                    {codeSlugs.has(item.slug) && record ? <em>изменён</em> : null}
                    {record?.published === false ? <em className="is-hidden">скрыт</em> : null}
                  </span>
                </button>
                <AdminIconButton
                  icon="delete"
                  size="sm"
                  className="admin-products__copy admin-interiors__delete"
                  label={`Удалить интерьер «${item.title}»`}
                  title="Удалить интерьер"
                  disabled={store.busy}
                  onClick={() => void deleteInterior(item)}
                />
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  /* —— Карточка интерьера —— */
  const { form } = editing
  const busyAll = busy || store.busy
  const record = recordOf(form.slug)
  const rest = products.filter((item) => !form.productIds.includes(item.slug))

  return (
    <div className="admin-product">
      <div className="admin-product__bar">
        <button type="button" className="admin__ghost" onClick={() => setEditing(null)}>
          ← К списку
        </button>
        <h2>{editing.isNew ? 'Новый интерьер' : form.title}</h2>
        {!editing.isNew ? (
          <a
            className="admin-product__open"
            href={`/interiors/${form.slug}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Страница интерьера ↗
          </a>
        ) : null}
      </div>

      <section className="admin-field admin-interior">
        <div className="admin-media">
          <label className="admin-photo admin-interior__photo">
            {form.image ? <img src={form.image} alt="" /> : null}
            <span className="admin-photo__over">
              {form.image ? 'Заменить фото' : 'Загрузить фото'}
            </span>
            <input
              type="file"
              accept="image/*"
              disabled={busyAll}
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) void uploadPhoto(file)
              }}
            />
          </label>
          <FrameButton
            src={form.image}
            aspects={INTERIOR_FRAMES}
            disabled={busyAll}
            onChange={(image) => patch({ image })}
          />
        </div>
        <div className="admin-interior__fields">
          <label>
            Заголовок
            <input value={form.title} onChange={(e) => patch({ title: e.target.value })} />
          </label>
          {editing.isNew ? (
            <label>
              Адрес страницы (латиницей)
              <input
                value={form.slug}
                placeholder={slugify(form.title)}
                onChange={(e) => patch({ slug: slugify(e.target.value) })}
              />
            </label>
          ) : null}
          <label>
            Текст
            <textarea
              rows={3}
              value={form.caption}
              onChange={(e) => patch({ caption: e.target.value })}
            />
          </label>
          <label>
            Комната
            <select value={form.room} onChange={(e) => patch({ room: e.target.value })}>
              <option value="">— не указана —</option>
              {rooms.map((room) => (
                <option key={room.slug} value={room.slug}>
                  {room.label}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="admin-field__role">Бренды (интерьер покажется на их страницах)</span>
            <div className="admin-checks">
              {brands.map((brand) => (
                <label key={brand.slug} className="admin-check">
                  <input
                    type="checkbox"
                    checked={form.brands.includes(brand.slug)}
                    onChange={(e) =>
                      patch({
                        brands: e.target.checked
                          ? [...form.brands, brand.slug]
                          : form.brands.filter((slug) => slug !== brand.slug),
                      })
                    }
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          </div>
          <label className="admin-check">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => patch({ published: e.target.checked })}
            />
            Показывать на сайте
          </label>
        </div>
      </section>

      <section className="admin-field admin-pick">
        <h3>Товары в интерьере</h3>
        <p className="admin-field__hint">
          Модели, которые стоят на фото. Блок «Предметы в интерьере» на сайте появится, когда
          отмечено «подтверждено».
        </p>
        <ol className="admin-pick__list">
          {form.productIds.map((slug, index) => {
            const product = productBySlug.get(slug)
            return (
              <li key={slug} className="admin-pick__row">
                {product?.image ? (
                  <img src={product.image} alt="" />
                ) : (
                  <span className="admin-pick__noimg" />
                )}
                <span className="admin-pick__name">
                  <strong>{product?.name || `Нет товара «${slug}»`}</strong>
                  <span>{product ? `${resolveBrandName(product)} · ${product.category}` : ''}</span>
                </span>
                <span className="admin-pick__tools">
                  <button
                    type="button"
                    disabled={index === 0}
                    aria-label="Выше"
                    onClick={() => patch({ productIds: moved(form.productIds, index, -1) })}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === form.productIds.length - 1}
                    aria-label="Ниже"
                    onClick={() => patch({ productIds: moved(form.productIds, index, 1) })}
                  >
                    ↓
                  </button>
                  <AdminIconButton
                    icon="delete"
                    size="sm"
                    label="Убрать"
                    onClick={() => patch({ productIds: form.productIds.filter((s) => s !== slug) })}
                  />
                </span>
              </li>
            )
          })}
          {form.productIds.length === 0 ? (
            <li className="admin-pick__empty">Товары не выбраны</li>
          ) : null}
        </ol>
        <div className="admin-pick__add">
          <select
            value={addProduct}
            onChange={(e) => setAddProduct(e.target.value)}
            aria-label="Товар"
          >
            <option value="">Добавить товар…</option>
            {brands.map((brand) => {
              const list = rest.filter((item) => item.brandSlug === brand.slug)
              return list.length ? (
                <optgroup key={brand.slug} label={brand.name}>
                  {list.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {`${item.name} · ${item.category}`}
                    </option>
                  ))}
                </optgroup>
              ) : null
            })}
          </select>
          <button
            type="button"
            className="admin-field__save"
            disabled={!addProduct}
            onClick={() => {
              patch({ productIds: [...form.productIds, addProduct] })
              setAddProduct('')
            }}
          >
            Добавить
          </button>
        </div>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={form.productsConfirmed}
            onChange={(e) => patch({ productsConfirmed: e.target.checked })}
          />
          Подтверждено: эти модели действительно на фото
        </label>
      </section>

      {form.image ? (
        <HotspotsEditor
          image={stripFrame(form.image)}
          hotspots={form.hotspots}
          productIds={form.productIds}
          productBySlug={productBySlug}
          onChange={(hotspots) => {
            /* товар точки — и в «Товары в интерьере» */
            const ids = [...form.productIds]
            for (const spot of hotspots)
              if (spot.product && !ids.includes(spot.product)) ids.push(spot.product)
            patch({ hotspots, productIds: ids })
          }}
        />
      ) : null}

      <div className="admin-product__save">
        <button type="button" disabled={busyAll} onClick={() => void save()}>
          {busyAll ? 'Сохранение…' : 'Сохранить интерьер'}
        </button>
        {record && codeSlugs.has(form.slug) ? (
          <button
            type="button"
            className="admin-field__link"
            disabled={busyAll}
            onClick={() => void removeRecord(form.slug)}
          >
            Вернуть версию из кода
          </button>
        ) : null}
        {!editing.isNew ? (
          <AdminIconButton
            icon="delete"
            label="Удалить интерьер"
            disabled={busyAll}
            onClick={() => void deleteInterior(form)}
          />
        ) : null}
      </div>
    </div>
  )
}
