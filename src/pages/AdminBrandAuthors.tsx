import { useState } from 'react'
import { brands } from '../data/brands'
import { products } from '../data/products'
import { explainError, uploadAdminFile } from './adminUpload'
import { FrameButton } from './AdminFrame'
import { FRAMES } from './adminFrames'
import { saveBrandField } from './adminBrandStore'
import type { AdminMessage } from './adminListStore'
import type { BrandAuthor } from '../types'
import { AdminIconButton } from './AdminIconButton'

/** Автор в форме: все поля строками, модели — список адресов товаров */
type AuthorForm = { name: string; role: string; bio: string; photo: string; models: string[] }

const emptyAuthor = (): AuthorForm => ({
  name: '',
  role: 'Дизайнер',
  bio: '',
  photo: '',
  models: [],
})

/**
 * Авторы бренда: фото, ФИО, роль, текст и модели автора. На сайте автор
 * показывается, только когда у него выбрана хотя бы одна модель.
 * Правки копятся и сохраняются кнопкой «Сохранить авторов».
 */
export default function AdminBrandAuthors({
  brandSlug,
  onMessage,
  onChanged,
}: {
  brandSlug: string
  onMessage: (message: AdminMessage) => void
  onChanged: () => void
}) {
  const brand = brands.find((item) => item.slug === brandSlug)
  const [list, setList] = useState<AuthorForm[]>(() =>
    (brand?.authors || []).map((author) => ({
      ...emptyAuthor(),
      name: author.name,
      role: author.role,
      bio: author.bio || '',
      photo: author.photo || '',
      models: [...(author.models || [])],
    })),
  )
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [addModel, setAddModel] = useState<Record<number, string>>({})

  if (!brand) return null
  const mine = products.filter((item) => item.brandSlug === brandSlug)
  const bySlug = new Map(mine.map((item) => [item.slug, item]))

  function update(index: number, patch: Partial<AuthorForm>) {
    setList((prev) => prev.map((author, i) => (i === index ? { ...author, ...patch } : author)))
    setDirty(true)
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= list.length) return
    const next = [...list]
    ;[next[index], next[target]] = [next[target], next[index]]
    setList(next)
    setDirty(true)
  }

  async function uploadPhoto(index: number, file: File) {
    setBusy(true)
    try {
      update(index, { photo: await uploadAdminFile(file) })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось загрузить фото') })
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    const cleaned: BrandAuthor[] = list
      .filter((author) => author.name.trim())
      .map((author) => ({
        name: author.name.trim(),
        role: author.role.trim() || 'Дизайнер',
        ...(author.bio.trim() ? { bio: author.bio.trim() } : {}),
        ...(author.photo ? { photo: author.photo } : {}),
        link: `/catalog?brand=${encodeURIComponent(brandSlug)}`,
        models: author.models.filter((slug) => bySlug.has(slug)),
      }))
    setBusy(true)
    try {
      await saveBrandField(brandSlug, 'authors', cleaned)
      setDirty(false)
      onChanged()
      const hidden = cleaned.filter((author) => !author.models?.length).length
      onMessage({
        ok: hidden
          ? `Авторы сохранены. Без моделей на сайте не показываются: ${hidden}`
          : 'Авторы сохранены',
      })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить авторов') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin-field admin-pick admin-authors">
      <h3>Авторы</h3>
      <p className="admin-field__hint">
        Автор виден на странице бренда, когда у него выбрана хотя бы одна модель.
      </p>

      {list.map((author, index) => (
        <article key={index} className="admin-author">
          <div className="admin-media">
            <label className="admin-photo admin-author__photo">
              {author.photo ? <img src={author.photo} alt="" /> : null}
              <span className="admin-photo__over">{author.photo ? 'Заменить' : 'Фото'}</span>
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) void uploadPhoto(index, file)
                }}
              />
            </label>
            <FrameButton
              short
              src={author.photo}
              aspects={FRAMES.portrait}
              disabled={busy}
              onChange={(photo) => update(index, { photo })}
            />
          </div>

          <div className="admin-author__body">
            <input
              className="admin-author__name"
              placeholder="ФИО"
              value={author.name}
              onChange={(e) => update(index, { name: e.target.value })}
            />
            <input
              placeholder="Роль, например «Дизайнер»"
              value={author.role}
              onChange={(e) => update(index, { role: e.target.value })}
            />
            <textarea
              rows={3}
              placeholder="Текст об авторе"
              value={author.bio}
              onChange={(e) => update(index, { bio: e.target.value })}
            />

            {author.models.length === 0 ? (
              <p className="admin-author__warn">
                Не виден на сайте — выберите хотя бы одну модель автора ниже.
              </p>
            ) : null}
            <div className="admin-author__models">
              <span className="admin-field__role">Модели автора</span>
              {author.models.map((slug) => (
                <span key={slug} className="admin-chip">
                  {bySlug.get(slug)?.name || slug}
                  <AdminIconButton
                    icon="delete"
                    size="sm"
                    label="Убрать модель"
                    onClick={() =>
                      update(index, { models: author.models.filter((s) => s !== slug) })
                    }
                  />
                </span>
              ))}
              <select
                value={addModel[index] || ''}
                aria-label="Добавить модель автора"
                onChange={(e) => {
                  const slug = e.target.value
                  setAddModel((prev) => ({ ...prev, [index]: '' }))
                  if (slug && !author.models.includes(slug)) {
                    update(index, { models: [...author.models, slug] })
                  }
                }}
              >
                <option value="">+ модель</option>
                {mine
                  .filter((item) => !author.models.includes(item.slug))
                  .map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {`${item.name} · ${item.category}`}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="admin-pick__tools admin-author__tools">
            <button
              type="button"
              disabled={busy || index === 0}
              aria-label="Выше"
              onClick={() => move(index, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              disabled={busy || index === list.length - 1}
              aria-label="Ниже"
              onClick={() => move(index, 1)}
            >
              ↓
            </button>
            <AdminIconButton
              icon="delete"
              size="sm"
              disabled={busy}
              label="Удалить автора"
              onClick={() => {
                setList((prev) => prev.filter((_, i) => i !== index))
                setDirty(true)
              }}
            />
          </div>
        </article>
      ))}

      <div className="admin-authors__actions">
        <button
          type="button"
          className="admin__ghost"
          onClick={() => {
            setList((prev) => [...prev, emptyAuthor()])
            setDirty(true)
          }}
        >
          + Автор
        </button>
        <button
          type="button"
          className="admin-field__save"
          disabled={busy || !dirty}
          onClick={() => void save()}
        >
          {busy ? 'Сохранение…' : 'Сохранить авторов'}
        </button>
      </div>
    </section>
  )
}
