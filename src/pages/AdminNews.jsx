import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { newsCategories } from '../content'
import './Admin.css'

const emptyForm = {
  title: '',
  slug: '',
  date: '',
  category: 'События',
  excerpt: '',
  image: '',
  gallery: '',
  body: '',
  ctaLabel: 'Оставить заявку',
  ctaHref: '/contacts',
  externalUrl: '',
  videoUrl: '',
  published: true,
}

function toInputDate(ruDate) {
  const match = String(ruDate || '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

function toRuDate(isoDate) {
  const match = String(isoDate || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return String(isoDate || '')
  return `${match[3]}.${match[2]}.${match[1]}`
}

function articleToForm(item) {
  return {
    title: item.title || '',
    slug: item.slug || '',
    date: toInputDate(item.date),
    category: item.category || 'События',
    excerpt: item.excerpt || '',
    image: item.image || '',
    gallery: (item.images || [])
      .map((img) =>
        img.caption ? `${img.src} | ${img.caption}` : img.src,
      )
      .join('\n'),
    body: (item.body || []).join('\n\n'),
    ctaLabel: item.ctaLabel || '',
    ctaHref: item.ctaHref || '',
    externalUrl: item.externalUrl || '',
    videoUrl: item.videoUrl || '',
    published: item.published !== false,
  }
}

function formToPayload(form) {
  const images = form.gallery
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [src, ...rest] = line.split('|')
      return {
        src: src.trim(),
        caption: rest.join('|').trim(),
      }
    })

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
    externalUrl: form.externalUrl.trim(),
    videoUrl: form.videoUrl.trim(),
    published: form.published,
  }
}

export default function AdminNews({ onMessage, onChanged }) {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)

  const categoryOptions = useMemo(
    () => newsCategories.filter((name) => name !== 'Все'),
    [],
  )

  async function load() {
    setReady(false)
    try {
      const data = await api('/api/news/admin')
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      onMessage?.({ error: err?.message || 'Не удалось загрузить новости' })
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

  function startEdit(item) {
    setEditingId(item.id)
    setForm(articleToForm(item))
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  async function save(event) {
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
      onMessage?.({ error: err?.message || 'Не удалось сохранить' })
    } finally {
      setBusy(false)
    }
  }

  async function remove(item) {
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
      onMessage?.({ error: err?.message || 'Не удалось удалить' })
    } finally {
      setBusy(false)
    }
  }

  async function uploadCover(file) {
    if (!file) return
    setBusy(true)
    onMessage?.({ error: '', ok: '' })
    try {
      const body = new FormData()
      body.append('file', file)
      const data = await api('/api/news/upload', { method: 'POST', body })
      setForm((prev) => ({ ...prev, image: data.url }))
      onMessage?.({ ok: 'Обложка загружена' })
    } catch (err) {
      onMessage?.({ error: err?.message || 'Не удалось загрузить файл' })
    } finally {
      setBusy(false)
    }
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
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Дата
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Категория
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                {categoryOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              slug (необязательно)
              <input
                value={form.slug}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="сгенерируется из заголовка"
              />
            </label>
          </div>

          <label>
            Краткий анонс
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, excerpt: e.target.value }))
              }
            />
          </label>

          <label>
            Обложка (URL или /uploads/…)
            <input
              value={form.image}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, image: e.target.value }))
              }
            />
          </label>
          <label className="admin-news-form__file">
            Загрузить обложку
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadCover(e.target.files?.[0])}
            />
          </label>
          {form.image ? (
            <img className="admin-news-form__preview" src={form.image} alt="" />
          ) : null}

          <label>
            Галерея — по строке: url или url | подпись
            <textarea
              rows={4}
              value={form.gallery}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, gallery: e.target.value }))
              }
              placeholder="/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg | Подпись"
            />
          </label>

          <label>
            Текст — абзацы через пустую строку
            <textarea
              rows={8}
              value={form.body}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, body: e.target.value }))
              }
              required
            />
          </label>

          <div className="admin-news-form__grid">
            <label>
              Текст кнопки
              <input
                value={form.ctaLabel}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))
                }
              />
            </label>
            <label>
              Ссылка кнопки
              <input
                value={form.ctaHref}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, ctaHref: e.target.value }))
                }
              />
            </label>
            <label>
              Внешняя ссылка
              <input
                value={form.externalUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, externalUrl: e.target.value }))
                }
              />
            </label>
            <label>
              Видео (embed URL)
              <input
                value={form.videoUrl}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, videoUrl: e.target.value }))
                }
              />
            </label>
          </div>

          <label className="admin-news-form__check">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, published: e.target.checked }))
              }
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
              <button type="button" disabled={busy} onClick={() => startEdit(item)}>
                Изменить
              </button>
              <button
                type="button"
                className="admin__danger"
                disabled={busy}
                onClick={() => remove(item)}
              >
                Удалить
              </button>
            </div>
          </article>
        ))}
        {ready && items.length === 0 ? (
          <p className="admin__loading">Новостей пока нет</p>
        ) : null}
      </div>
    </section>
  )
}
