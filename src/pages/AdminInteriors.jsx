import { useRef, useState } from 'react'
import { api } from '../api'
import { brands } from '../data/brands'
import { interiors } from '../data/interiors'
import { applyInteriorRecords, codeInteriors } from '../data/interiorsRuntime'
import { products } from '../data/products'
import { rooms } from '../data/rooms'
import { resolveBrandName } from '../lib/catalog'
import { explainError, uploadAdminFile } from './adminUpload'
import { FrameButton } from './AdminFrame'
import { FRAMES } from './adminFrames'
import { stripFrame } from '../lib/imageFrame'
import { moved, useStoredList } from './adminListStore'
import './AdminEditor.css'
import { slugify as toSlug } from './adminSlug'

const KEY = 'interiors.records'
const codeSlugs = new Set(codeInteriors.map((item) => item.slug))

const slugify = (text) => toSlug(text, { max: 60 })

/**
 * Точки на фото: нажатие ставит точку, точку можно перетащить,
 * у каждой — товар. Координаты в процентах от фото.
 */
function HotspotsEditor({ image, hotspots, productIds, productBySlug, onChange }) {
  const frameRef = useRef(null)
  const dragRef = useRef(-1)
  const [active, setActive] = useState(-1)

  const pointAt = (event) => {
    const rect = frameRef.current.getBoundingClientRect()
    const round = (v) => Math.round(Math.min(100, Math.max(0, v)) * 10) / 10
    return {
      x: round(((event.clientX - rect.left) / rect.width) * 100),
      y: round(((event.clientY - rect.top) / rect.height) * 100),
    }
  }

  function onFramePointerDown(event) {
    if (event.target.closest('.admin-spot')) return
    const { x, y } = pointAt(event)
    const product = productIds.find((slug) => !hotspots.some((spot) => spot.product === slug)) || ''
    onChange([...hotspots, { product, x, y }])
    setActive(hotspots.length)
  }

  function onSpotPointerDown(event, index) {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = index
    setActive(index)
  }

  function onSpotPointerMove(event) {
    const index = dragRef.current
    if (index < 0) return
    const { x, y } = pointAt(event)
    onChange(hotspots.map((spot, i) => (i === index ? { ...spot, x, y } : spot)))
  }

  const options = [...productBySlug.values()]

  return (
    <section className="admin-field admin-spots">
      <h3>Точки на фото</h3>
      <p className="admin-field__hint">
        Нажмите на фото, чтобы поставить точку; точку можно перетащить. На сайте точки видны, когда
        отмечено «Подтверждено: эти модели действительно на фото».
      </p>
      <div className="admin-spots__grid">
        <div ref={frameRef} className="admin-spots__frame" onPointerDown={onFramePointerDown}>
          <img src={image} alt="" draggable={false} />
          {hotspots.map((spot, index) => (
            <button
              key={index}
              type="button"
              className={[
                'admin-spot',
                active === index ? 'is-active' : '',
                spot.product ? '' : 'is-empty',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              title={productBySlug.get(spot.product)?.name || 'Выберите товар'}
              onPointerDown={(e) => onSpotPointerDown(e, index)}
              onPointerMove={onSpotPointerMove}
              onPointerUp={() => {
                dragRef.current = -1
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <ol className="admin-spots__list">
          {hotspots.map((spot, index) => (
            <li key={index} className={active === index ? 'is-active' : undefined}>
              <span className="admin-spots__num">{index + 1}</span>
              <select
                value={spot.product}
                aria-label={`Товар точки ${index + 1}`}
                onFocus={() => setActive(index)}
                onChange={(e) =>
                  onChange(
                    hotspots.map((s, i) => (i === index ? { ...s, product: e.target.value } : s)),
                  )
                }
              >
                <option value="">Выберите товар…</option>
                {options.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {`${item.name} · ${item.brand}`}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label={`Удалить точку ${index + 1}`}
                onClick={() => {
                  onChange(hotspots.filter((_, i) => i !== index))
                  setActive(-1)
                }}
              >
                ×
              </button>
            </li>
          ))}
          {hotspots.length === 0 ? (
            <li className="admin-pick__empty">Точек пока нет — нажмите на фото</li>
          ) : null}
        </ol>
      </div>
    </section>
  )
}

/** Текущий вид интерьера (с правками) → форма */
function toForm(item, record) {
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

export default function AdminInteriors({ onMessage }) {
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [addProduct, setAddProduct] = useState('')
  const store = useStoredList(KEY, () => [], {
    onMessage,
    okText: 'Интерьер сохранён',
    onSaved: (value) => applyInteriorRecords(value || []),
  })

  if (!store.list) return <p className="admin__loading">Загрузка интерьеров…</p>
  const records = store.list
  const recordOf = (slug) => records.find((item) => item.slug === slug) || null

  /* список: интерьеры на сайте + скрытые */
  const rows = [
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

  function patch(update) {
    setEditing((prev) => ({ ...prev, form: { ...prev.form, ...update } }))
  }

  async function uploadPhoto(file) {
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
    const record = {
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
          ['title', title],
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
        setEditing((prev) => ({ ...prev, isNew: false, form: { ...prev.form, slug } }))
      }
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить интерьер') })
    } finally {
      setBusy(false)
    }
  }

  async function removeRecord(slug) {
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
  async function deleteInterior(item) {
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
                <button
                  type="button"
                  className="admin-products__copy admin-interiors__delete"
                  aria-label={`Удалить интерьер «${item.title}»`}
                  title="Удалить интерьер"
                  disabled={store.busy}
                  onClick={() => void deleteInterior(item)}
                >
                  ×
                </button>
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
                  <button
                    type="button"
                    aria-label="Убрать"
                    onClick={() => patch({ productIds: form.productIds.filter((s) => s !== slug) })}
                  >
                    ×
                  </button>
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
          <button
            type="button"
            className="admin__danger"
            disabled={busyAll}
            onClick={() => void deleteInterior(form)}
          >
            Удалить интерьер
          </button>
        ) : null}
      </div>
    </div>
  )
}
