import { useEffect, useState } from 'react'
import { brands } from '../data/brands'
import { type AdminBrandRecord, codeBrands } from '../data/brandsRuntime'
import { products } from '../data/products'
import AdminBrandPagePicker from './AdminBrandPagePicker'
import { explainError, uploadAdminFile } from './adminUpload'
import { FrameButton } from './AdminFrame'
import { FRAMES, type FrameAspect } from './adminFrames'
import type { AdminMessage } from './adminListStore'
import type { Brand, BrandEntry } from '../types'
import {
  deleteBrandRecord,
  getBrandRecord,
  getBrandRecords,
  loadBrandRecords,
  saveBrandRecord,
} from './adminBrandStore'
import './AdminEditor.css'
import { slugify as toSlug } from './adminSlug'
import { AdminIconButton } from './AdminIconButton'

const slugify = (text: unknown) => toSlug(text, { max: 60, amp: true })

type TextKey = 'description' | 'intro' | 'about'
type PhotoKey = 'logo' | 'heroImage' | 'image'

const TEXTS: [TextKey, string, number][] = [
  ['description', 'Описание в списке брендов', 2],
  ['intro', 'Подзаголовок первого экрана', 2],
  ['about', 'О бренде', 4],
]

/* где на сайте стоят фото бренда */
const BRAND_FRAMES: Record<'heroImage' | 'image', FrameAspect[]> = {
  heroImage: FRAMES.hero,
  image: [{ label: 'Карточка в списке брендов', ratio: 4 / 3 }],
}

const PHOTOS: [PhotoKey, string][] = [
  ['logo', 'Логотип'],
  ['heroImage', 'Фото первого экрана'],
  ['image', 'Фото в списке брендов'],
]

/** Форма карточки бренда */
type BrandForm = {
  slug: string
  name: string
  website: string
  description: string
  intro: string
  about: string
  logo: string
  heroImage: string
  image: string
  collections: BrandEntry[]
}

type BrandEditing = { isNew: boolean; form: BrandForm; published: boolean }

function toForm(brand: Partial<Brand> | null): BrandForm {
  return {
    slug: brand?.slug || '',
    name: brand?.name || '',
    website: brand?.website || '',
    description: brand?.description || '',
    intro: brand?.intro || '',
    about: brand?.about || '',
    logo: brand?.logo || '',
    heroImage: brand?.heroImage || '',
    image: brand?.image || '',
    collections: (brand?.collections || []).map((item) => ({ ...item })),
  }
}

/**
 * «Бренды»: карточка бренда — название, сайт, тексты, фото, коллекции,
 * что показывать на странице бренда (товары, интерьеры, каталоги) и все
 * товары бренда. Новый бренд получает свою страницу /brands/<адрес>.
 */
type AdminBrandEditorProps = {
  onMessage: (message: AdminMessage) => void
  /** открыть товар во вкладке «Товары» */
  onOpenProduct: (slug: string) => void
  /** начать новый товар этого бренда во вкладке «Товары» */
  onNewProduct: (brandSlug: string) => void
}

export default function AdminBrandEditor({
  onMessage,
  onOpenProduct,
  onNewProduct,
}: AdminBrandEditorProps) {
  const [ready, setReady] = useState(false)
  const [rev, setRev] = useState(0)
  const [editing, setEditing] = useState<BrandEditing | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    loadBrandRecords(true)
      .catch((err: unknown) =>
        onMessage({ error: explainError(err, 'Не удалось загрузить бренды') }),
      )
      .finally(() => setReady(true))
  }, [onMessage])

  if (!ready) return <p className="admin__loading">Загрузка брендов…</p>

  /* список: бренды на сайте + скрытые из админки */
  const records = getBrandRecords()
  const codeSlugs = new Set(codeBrands.map((brand) => brand.slug))
  type BrandRow = { brand: Partial<Brand> & { slug: string }; record: AdminBrandRecord | null }
  const visible: BrandRow[] = brands.map((brand) => ({ brand, record: getBrandRecord(brand.slug) }))
  const hidden: BrandRow[] = records
    .filter((record) => !record.published)
    .map((record) => ({
      brand: codeBrands.find((b) => b.slug === record.slug) || {
        slug: record.slug,
        ...record.data,
      },
      record,
    }))
  const rows = [...visible, ...hidden]

  function patch(update: Partial<BrandForm>) {
    setEditing((prev) => (prev ? { ...prev, form: { ...prev.form, ...update } } : prev))
  }

  async function upload(file: File, onUrl: (url: string) => void) {
    setBusy(true)
    try {
      onUrl(await uploadAdminFile(file))
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось загрузить фото') })
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    if (!editing) return
    const { form, isNew, published } = editing
    const name = form.name.trim()
    const slug = isNew ? form.slug || slugify(name) : form.slug
    if (!name) {
      onMessage({ error: 'Укажите название бренда' })
      return
    }
    if (isNew && (rows.some((row) => row.brand.slug === slug) || !slug)) {
      onMessage({ error: `Бренд с адресом «${slug}» уже есть — измените адрес` })
      return
    }
    setBusy(true)
    try {
      const previous = getBrandRecord(slug)?.data || {}
      const data = {
        ...previous,
        name,
        filter: name,
        website: form.website.trim(),
        description: form.description.trim(),
        intro: form.intro.trim(),
        about: form.about.trim(),
        logo: form.logo,
        heroImage: form.heroImage,
        image: form.image,
        collections: form.collections.filter((item) => item.title.trim()),
      }
      await saveBrandRecord(slug, data, published)
      setRev((n) => n + 1)
      setEditing((prev) => (prev ? { ...prev, isNew: false, form: { ...prev.form, slug } } : prev))
      onMessage({ ok: `Бренд сохранён: ${name}` })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить бренд') })
    } finally {
      setBusy(false)
    }
  }

  async function remove(slug: string, isCode: boolean) {
    const text = isCode
      ? 'Вернуть бренд к версии из кода? Правки из админки будут удалены.'
      : 'Удалить бренд? Его страница пропадёт, товары бренда останутся в «Товарах».'
    if (!window.confirm(text)) return
    setBusy(true)
    try {
      await deleteBrandRecord(slug)
      setRev((n) => n + 1)
      setEditing(null)
      onMessage({ ok: isCode ? 'Возвращена версия из кода' : 'Бренд удалён' })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось удалить') })
    } finally {
      setBusy(false)
    }
  }

  /* —— Список —— */
  if (!editing) {
    return (
      <div className="admin-products" data-rev={rev}>
        <div className="admin__toolbar">
          <button
            type="button"
            onClick={() => setEditing({ isNew: true, form: toForm(null), published: true })}
          >
            + Добавить бренд
          </button>
          <span className="admin__dirty">{`Брендов: ${rows.length}`}</span>
        </div>
        <ul className="admin-products__list">
          {rows.map(({ brand, record }) => {
            const count = products.filter((item) => item.brandSlug === brand.slug).length
            const isCode = codeSlugs.has(brand.slug)
            return (
              <li key={brand.slug}>
                <button
                  type="button"
                  className="admin-products__row"
                  onClick={() =>
                    setEditing({
                      isNew: false,
                      form: toForm(
                        record && !record.published ? { ...brand, ...record.data } : brand,
                      ),
                      published: record ? record.published : true,
                    })
                  }
                >
                  {brand.logo ? (
                    <img src={brand.logo} alt="" className="admin-products__logo" />
                  ) : (
                    <span className="admin-products__noimg" />
                  )}
                  <span className="admin-products__name">
                    <strong>{brand.name}</strong>
                    <span>{`/brands/${brand.slug} · товаров: ${count}`}</span>
                  </span>
                  <span className="admin-products__tags">
                    {!isCode ? <em>новый</em> : null}
                    {isCode && record ? <em>изменён</em> : null}
                    {record && !record.published ? <em className="is-hidden">скрыт</em> : null}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  /* —— Карточка бренда —— */
  const { form } = editing
  const slug = form.slug
  const isCode = codeSlugs.has(slug)
  const record = getBrandRecord(slug)
  const brandProducts = products.filter((item) => item.brandSlug === slug)
  const saved = !editing.isNew && brands.some((brand) => brand.slug === slug)

  return (
    <div className="admin-product" data-rev={rev}>
      <div className="admin-product__bar">
        <button type="button" className="admin__ghost" onClick={() => setEditing(null)}>
          ← К списку
        </button>
        <h2>{editing.isNew ? 'Новый бренд' : form.name}</h2>
        {saved ? (
          <a
            className="admin-product__open"
            href={`/brands/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Страница бренда ↗
          </a>
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
              value={form.slug}
              placeholder={slugify(form.name)}
              disabled={!editing.isNew}
              onChange={(e) => patch({ slug: slugify(e.target.value) })}
            />
          </label>
          <label>
            Сайт фабрики
            <input
              value={form.website}
              placeholder="https://…"
              onChange={(e) => patch({ website: e.target.value })}
            />
          </label>
        </div>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={editing.published}
            onChange={(e) =>
              setEditing((prev) => (prev ? { ...prev, published: e.target.checked } : prev))
            }
          />
          Показывать на сайте
        </label>
      </section>

      <section className="admin-field">
        <h3>Тексты</h3>
        {TEXTS.map(([key, label, rows]) => (
          <label key={key}>
            {label}
            <textarea
              rows={rows}
              value={form[key]}
              onChange={(e) => patch({ [key]: e.target.value } as Partial<BrandForm>)}
            />
          </label>
        ))}
      </section>

      <section className="admin-field">
        <h3>Фото</h3>
        <div className="admin-brand-photos">
          {PHOTOS.map(([key, label]) => (
            <div key={key}>
              <span className="admin-field__role">{label}</span>
              <label
                className={['admin-photo', key === 'logo' ? 'is-logo' : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {form[key] ? <img src={form[key]} alt="" /> : null}
                <span className="admin-photo__over">{form[key] ? 'Заменить' : 'Загрузить'}</span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file)
                      void upload(file, (url) => patch({ [key]: url } as Partial<BrandForm>))
                  }}
                />
              </label>
              {key !== 'logo' ? (
                <FrameButton
                  src={form[key]}
                  aspects={BRAND_FRAMES[key]}
                  disabled={busy}
                  onChange={(url) => patch({ [key]: url } as Partial<BrandForm>)}
                />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="admin-field">
        <h3>Коллекции</h3>
        <p className="admin-field__hint">Название коллекции потом выбирается в карточке товара.</p>
        {form.collections.map((item, i) => (
          <div key={i} className="admin-variant">
            <input
              placeholder="Название коллекции"
              value={item.title}
              onChange={(e) => {
                const next = [...form.collections]
                next[i] = { ...item, title: e.target.value }
                patch({ collections: next })
              }}
            />
            <input
              placeholder="Короткое описание"
              value={item.text || ''}
              onChange={(e) => {
                const next = [...form.collections]
                next[i] = { ...item, text: e.target.value }
                patch({ collections: next })
              }}
            />
            <FrameButton
              short
              src={item.image || ''}
              aspects={FRAMES.card43}
              disabled={busy}
              onChange={(image) => {
                const next = [...form.collections]
                next[i] = { ...item, image }
                patch({ collections: next })
              }}
            />
            <label className="admin-variant__file">
              {item.image ? <img src={item.image} alt="" /> : null}
              Фото
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (!file) return
                  void upload(file, (url) =>
                    setEditing((prev) => {
                      if (!prev) return prev
                      const next = [...prev.form.collections]
                      next[i] = { ...next[i], image: url }
                      return { ...prev, form: { ...prev.form, collections: next } }
                    }),
                  )
                }}
              />
            </label>
            <AdminIconButton
              icon="delete"
              label="Удалить коллекцию"
              onClick={() => patch({ collections: form.collections.filter((_, j) => j !== i) })}
            />
          </div>
        ))}
        <button
          type="button"
          className="admin__ghost"
          onClick={() =>
            patch({ collections: [...form.collections, { title: '', text: '', image: '' }] })
          }
        >
          + Коллекция
        </button>
      </section>

      <div className="admin-product__save">
        <button type="button" disabled={busy} onClick={() => void save()}>
          {busy ? 'Сохранение…' : 'Сохранить бренд'}
        </button>
        {record && isCode ? (
          <button
            type="button"
            className="admin__danger"
            disabled={busy}
            onClick={() => void remove(slug, isCode)}
          >
            Вернуть версию из кода
          </button>
        ) : record ? (
          <AdminIconButton
            icon="delete"
            label="Удалить бренд"
            disabled={busy}
            onClick={() => void remove(slug, isCode)}
          />
        ) : null}
      </div>

      {/* —— Страница бренда и товары: после сохранения —— */}
      {saved ? (
        <>
          <h3 className="admin-brand__title">Страница бренда</h3>
          <div className="admin-brand-page">
            {['featured', 'interiors', 'catalogs', 'authors'].map((kind) => (
              <AdminBrandPagePicker
                key={kind}
                brandSlug={slug}
                kind={kind}
                onMessage={onMessage}
                onChanged={() => setRev((n) => n + 1)}
              />
            ))}
          </div>

          <section className="admin-field">
            <div className="admin-brand__head">
              <h3>{`Товары бренда · ${brandProducts.length}`}</h3>
              <button type="button" onClick={() => onNewProduct(slug)}>
                + Новый товар {form.name}
              </button>
            </div>
            <ul className="admin-pick__list">
              {brandProducts.map((product) => (
                <li key={product.slug} className="admin-pick__row">
                  {product.image ? (
                    <img src={product.image} alt="" />
                  ) : (
                    <span className="admin-pick__noimg" />
                  )}
                  <span className="admin-pick__name">
                    <strong>{product.name}</strong>
                    <span>
                      {[product.category, product.collection, product.price]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="admin__ghost"
                    onClick={() => onOpenProduct(product.slug)}
                  >
                    Открыть
                  </button>
                </li>
              ))}
              {brandProducts.length === 0 ? (
                <li className="admin-pick__empty">У бренда пока нет товаров — добавьте первый</li>
              ) : null}
            </ul>
          </section>
        </>
      ) : (
        <p className="admin-field__hint">
          Сохраните бренд — затем можно будет выбрать товары, интерьеры и каталоги для его страницы.
        </p>
      )}
    </div>
  )
}
