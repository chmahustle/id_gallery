import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { api } from '../api'
import type { NewsArticle } from '../news/NewsContext'
import { FrameButton } from './AdminFrame'
import { AdminIconButton } from './AdminIconButton'
import type { AdminMessage } from './adminListStore'
import './Admin.css'

/* где на сайте стоит обложка события */
const NEWS_FRAMES = [
  { label: 'Карточка в списке событий', ratio: 16 / 10 },
  { label: 'Обложка на странице события', ratio: 21 / 9 },
]

type GalleryPhoto = { src: string; caption: string }

/** Форма события: дата в формате поля ввода, текст — строкой */
type NewsForm = {
  title: string
  slug: string
  date: string
  category: string
  excerpt: string
  image: string
  gallery: GalleryPhoto[]
  body: string
  ctaLabel: string
  ctaHref: string
  showCta: boolean
  externalUrl: string
  videoUrl: string
  published: boolean
}

const emptyForm: NewsForm = {
  title: '',
  slug: '',
  date: '',
  category: 'События',
  excerpt: '',
  image: '',
  gallery: [],
  body: '',
  ctaLabel: 'Оставить заявку',
  ctaHref: '/contact',
  showCta: true,
  externalUrl: '',
  videoUrl: '',
  published: true,
}

function toInputDate(ruDate: unknown) {
  const match = String(ruDate || '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

function toRuDate(isoDate: unknown) {
  const match = String(isoDate || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return String(isoDate || '')
  return `${match[3]}.${match[2]}.${match[1]}`
}

function articleToForm(item: NewsArticle): NewsForm {
  return {
    title: item.title || '',
    slug: item.slug || '',
    date: toInputDate(item.date),
    category: item.category || 'События',
    excerpt: item.excerpt || '',
    image: item.image || '',
    gallery: (item.images || []).map((img) => ({ src: img.src, caption: img.caption || '' })),
    body: (item.body || []).join('\n\n'),
    ctaLabel: item.ctaLabel || '',
    ctaHref: item.ctaHref || '',
    showCta: item.showCta !== false,
    externalUrl: item.externalUrl || '',
    videoUrl: item.videoUrl || '',
    published: item.published !== false,
  }
}

function formToPayload(form: NewsForm) {
  const images = form.gallery
    .filter((photo) => photo.src.trim())
    .map((photo) => ({ src: photo.src.trim(), caption: photo.caption.trim() }))

  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    date: toRuDate(form.date),
    category: form.category,
    excerpt: form.excerpt.trim(),
    image: form.image.trim(),
    images,
    body: form.body,
    ctaLabel: form.ctaLabel.trim(),
    ctaHref: form.ctaHref.trim(),
    showCta: form.showCta,
    externalUrl: form.externalUrl.trim(),
    videoUrl: form.videoUrl.trim(),
    published: form.published,
  }
}

export default function AdminNews({
  onMessage,
  onChanged,
}: {
  onMessage?: (message: AdminMessage) => void
  onChanged?: () => Promise<void> | void
}) {
  const [items, setItems] = useState<NewsArticle[]>([])
  const [ready, setReady] = useState(false)
  /* id события в редакторе; 'new' — новое; null — редактор закрыт */
  const [editingId, setEditingId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<NewsForm>(emptyForm)
  const [busy, setBusy] = useState(false)

  /* категории уже заведённых событий — подсказкой; можно ввести новую */
  const categoryOptions = useMemo(
    () => [...new Set(['События', ...items.map((item) => item.category).filter(Boolean)])],
    [items],
  )

  async function load() {
    setReady(false)
    try {
      const data = await api<{ items?: NewsArticle[] }>('/api/news/admin')
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      onMessage?.({ error: (err as Error)?.message || 'Не удалось загрузить новости' })
    } finally {
      setReady(true)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startCreate() {
    const now = new Date()
    const localDate = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-')
    setEditingId('new')
    setForm({
      ...emptyForm,
      date: localDate,
    })
  }

  function startEdit(item: NewsArticle) {
    setEditingId(item.id ?? null)
    setForm(articleToForm(item))
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    onMessage?.({ error: '', ok: '' })
    try {
      const payload = formToPayload(form)
      if (editingId === 'new') {
        await api('/api/news', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        onMessage?.({ ok: 'Новость создана' })
      } else {
        await api(`/api/news/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        onMessage?.({ ok: 'Новость сохранена' })
      }
      cancelEdit()
      await load()
      await onChanged?.()
    } catch (err) {
      onMessage?.({ error: (err as Error)?.message || 'Не удалось сохранить' })
    } finally {
      setBusy(false)
    }
  }

  async function remove(item: NewsArticle) {
    if (!window.confirm(`Удалить «${item.title}»?`)) return
    setBusy(true)
    onMessage?.({ error: '', ok: '' })
    try {
      await api(`/api/news/${item.id}`, { method: 'DELETE' })
      onMessage?.({ ok: 'Новость удалена' })
      if (editingId === item.id) cancelEdit()
      await load()
      await onChanged?.()
    } catch (err) {
      onMessage?.({ error: (err as Error)?.message || 'Не удалось удалить' })
    } finally {
      setBusy(false)
    }
  }

  /** Загрузить фото события; адрес файла — в apply */
  async function uploadPhoto(file: File | undefined, apply: (url: string) => void, done: string) {
    if (!file) return
    setBusy(true)
    onMessage?.({ error: '', ok: '' })
    try {
      const body = new FormData()
      body.append('file', file)
      const data = await api<{ url: string }>('/api/news/upload', { method: 'POST', body })
      apply(data.url)
      onMessage?.({ ok: done })
    } catch (err) {
      onMessage?.({ error: (err as Error)?.message || 'Не удалось загрузить файл' })
    } finally {
      setBusy(false)
    }
  }

  function updatePhoto(index: number, patch: Partial<GalleryPhoto>) {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.map((photo, i) => (i === index ? { ...photo, ...patch } : photo)),
    }))
  }

  function removePhoto(index: number) {
    setForm((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }))
  }

  function movePhoto(index: number, shift: -1 | 1) {
    setForm((prev) => {
      const next = [...prev.gallery]
      const target = index + shift
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target]!, next[index]!]
      return { ...prev, gallery: next }
    })
  }

  return (
    <section className="admin__section">
      <div className="admin__toolbar">
        <button type="button" disabled={busy} onClick={startCreate}>
          + Добавить новость
        </button>
      </div>

      {!ready ? <p className="admin__loading">Загрузка новостей…</p> : null}

      {editingId != null ? (
        <form className="admin-news-form" onSubmit={save}>
          <h2>{editingId === 'new' ? 'Новая новость' : 'Редактирование'}</h2>
          <div className="admin-news-form__grid">
            <label>
              Заголовок
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </label>
            <label>
              Дата
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </label>
            <label>
              Категория
              <input
                list="admin-news-categories"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              />
              <datalist id="admin-news-categories">
                {categoryOptions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>
            <label>
              slug (необязательно)
              <input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="сгенерируется из заголовка"
              />
            </label>
          </div>

          <label>
            Краткий анонс
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
            />
          </label>

          <label>
            Обложка (URL или /uploads/…)
            <input
              value={form.image}
              onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
            />
          </label>
          <label className="admin-news-form__file">
            Загрузить обложку
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                void uploadPhoto(
                  file,
                  (image) => setForm((prev) => ({ ...prev, image })),
                  'Обложка загружена',
                )
              }}
            />
          </label>
          {form.image ? (
            <span className="admin-media">
              <img className="admin-news-form__preview" src={form.image} alt="" />
              <FrameButton
                src={form.image}
                aspects={NEWS_FRAMES}
                onChange={(image) => setForm((prev) => ({ ...prev, image }))}
              />
              <AdminIconButton
                icon="delete"
                label="Удалить обложку"
                disabled={busy}
                onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
              />
            </span>
          ) : null}

          <fieldset className="admin-news-gallery">
            <legend>Галерея события</legend>
            <p className="admin-field__hint">
              Первое фото — большое вверху страницы, последнее — отдельно внизу, остальные — полосой
              до 4 штук. Без обложки в списке событий показывается первое фото.
            </p>
            {form.gallery.length ? (
              <ul className="admin-news-gallery__list">
                {form.gallery.map((photo, index) => (
                  <li key={`${index}-${photo.src}`} className="admin-news-gallery__item">
                    <label className="admin-photo">
                      <img src={photo.src} alt="" />
                      <span className="admin-photo__over">Заменить</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={busy}
                        aria-label={`Заменить фото ${index + 1}`}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          void uploadPhoto(file, (src) => updatePhoto(index, { src }), 'Фото заменено')
                        }}
                      />
                    </label>
                    <input
                      aria-label={`Подпись к фото ${index + 1}`}
                      placeholder="Подпись (необязательно)"
                      value={photo.caption}
                      onChange={(e) => updatePhoto(index, { caption: e.target.value })}
                    />
                    <div className="admin-news-gallery__actions">
                      <button
                        type="button"
                        aria-label={`Фото ${index + 1} раньше`}
                        disabled={busy || index === 0}
                        onClick={() => movePhoto(index, -1)}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        aria-label={`Фото ${index + 1} позже`}
                        disabled={busy || index === form.gallery.length - 1}
                        onClick={() => movePhoto(index, 1)}
                      >
                        →
                      </button>
                      <AdminIconButton
                        icon="delete"
                        className="admin-news-gallery__remove"
                        label={`Удалить фото ${index + 1}`}
                        title="Удалить фото"
                        disabled={busy}
                        onClick={() => removePhoto(index)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
            <label className="admin-news-form__file">
              + Добавить фото
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  void uploadPhoto(
                    file,
                    (src) =>
                      setForm((prev) => ({ ...prev, gallery: [...prev.gallery, { src, caption: '' }] })),
                    'Фото добавлено',
                  )
                }}
              />
            </label>
          </fieldset>

          <label>
            Текст — абзацы через пустую строку
            <textarea
              rows={8}
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
              required
            />
          </label>

          <label className="admin-news-form__check">
            <input
              type="checkbox"
              checked={form.showCta}
              onChange={(e) => setForm((prev) => ({ ...prev, showCta: e.target.checked }))}
            />
            Показывать кнопку на странице события
          </label>

          <div className="admin-news-form__grid">
            <label>
              Текст кнопки
              <input
                value={form.ctaLabel}
                disabled={!form.showCta}
                onChange={(e) => setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
              />
            </label>
            <label>
              Ссылка кнопки
              <input
                value={form.ctaHref}
                disabled={!form.showCta}
                onChange={(e) => setForm((prev) => ({ ...prev, ctaHref: e.target.value }))}
              />
            </label>
            <label>
              Внешняя ссылка
              <input
                value={form.externalUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, externalUrl: e.target.value }))}
              />
            </label>
            <label>
              Видео (embed URL)
              <input
                value={form.videoUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
              />
            </label>
          </div>

          <label className="admin-news-form__check">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
            />
            Опубликовано
          </label>

          <div className="admin-news-form__actions">
            <button type="submit" disabled={busy}>
              {editingId === 'new' ? 'Создать' : 'Сохранить'}
            </button>
            <button type="button" disabled={busy} onClick={cancelEdit}>
              Отмена
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-news-list">
        {items.map((item) => (
          <article key={item.id} className="admin-news-list__item">
            {item.image ? <img src={item.image} alt="" /> : <div />}
            <div>
              <p className="admin-news-list__meta">
                {item.date} · {item.category}
                {!item.published ? ' · черновик' : ''}
              </p>
              <h3>{item.title}</h3>
              <p>{item.excerpt}</p>
            </div>
            <div className="admin-news-list__actions">
              <AdminIconButton
                icon="edit"
                label={`Изменить событие «${item.title}»`}
                title="Изменить"
                disabled={busy}
                onClick={() => startEdit(item)}
              />
              <AdminIconButton
                icon="delete"
                label={`Удалить событие «${item.title}»`}
                title="Удалить"
                disabled={busy}
                onClick={() => remove(item)}
              />
            </div>
          </article>
        ))}
        {ready && items.length === 0 ? <p className="admin__loading">Новостей пока нет</p> : null}
      </div>
    </section>
  )
}
