import { useEffect, useState } from 'react'
import { api } from '../api'
import './Admin.css'

const emptyForm = {
  name: '',
  filter: '',
  logo: '',
  website: '',
  sortOrder: 0,
  published: true,
}

function brandToForm(item) {
  return {
    name: item.name || '',
    filter: item.filter || '',
    logo: item.logo || '',
    website: item.website || '',
    sortOrder: item.sortOrder ?? 0,
    published: item.published !== false,
  }
}

function formToPayload(form) {
  return {
    name: form.name.trim(),
    filter: form.filter.trim() || form.name.trim(),
    logo: form.logo.trim(),
    website: form.website.trim(),
    sortOrder: Number(form.sortOrder) || 0,
    published: form.published,
  }
}

export default function AdminBrands({ onMessage, onChanged }) {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)

  async function load() {
    setReady(false)
    try {
      const data = await api('/api/brands/admin')
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      onMessage?.({ error: err?.message || 'Не удалось загрузить бренды' })
    } finally {
      setReady(true)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function startCreate() {
    setEditingId('new')
    setForm({
      ...emptyForm,
      sortOrder: items.length,
    })
  }

  function startEdit(item) {
    setEditingId(item.id)
    setForm(brandToForm(item))
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
        await api('/api/brands', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        onMessage?.({ ok: 'Бренд создан' })
      } else {
        await api(`/api/brands/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        onMessage?.({ ok: 'Бренд сохранён' })
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
    if (!window.confirm(`Удалить «${item.name}»?`)) return
    setBusy(true)
    onMessage?.({ error: '', ok: '' })
    try {
      await api(`/api/brands/${item.id}`, { method: 'DELETE' })
      onMessage?.({ ok: 'Бренд удалён' })
      if (editingId === item.id) cancelEdit()
      await load()
      await onChanged?.()
    } catch (err) {
      onMessage?.({ error: err?.message || 'Не удалось удалить' })
    } finally {
      setBusy(false)
    }
  }

  async function uploadLogo(file) {
    if (!file) return
    setBusy(true)
    onMessage?.({ error: '', ok: '' })
    try {
      const body = new FormData()
      body.append('file', file)
      const data = await api('/api/brands/upload', { method: 'POST', body })
      setForm((prev) => ({ ...prev, logo: data.url }))
      onMessage?.({ ok: 'Логотип загружен' })
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
          + Добавить бренд
        </button>
      </div>

      {!ready ? <p className="admin__loading">Загрузка брендов…</p> : null}

      {editingId != null ? (
        <form className="admin-news-form" onSubmit={save}>
          <h2>{editingId === 'new' ? 'Новый бренд' : 'Редактирование'}</h2>
          <div className="admin-news-form__grid">
            <label>
              Название
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </label>
            <label>
              Фильтр каталога
              <input
                value={form.filter}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, filter: e.target.value }))
                }
                placeholder="как в каталоге / товарах"
              />
            </label>
            <label>
              Порядок
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    sortOrder: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              Официальный сайт
              <input
                type="url"
                value={form.website}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, website: e.target.value }))
                }
                placeholder="https://"
              />
            </label>
          </div>

          <label>
            Логотип (URL или /uploads/…)
            <input
              value={form.logo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, logo: e.target.value }))
              }
            />
          </label>
          <label className="admin-news-form__file">
            Загрузить логотип
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadLogo(e.target.files?.[0])}
            />
          </label>
          {form.logo ? (
            <img className="admin-news-form__preview" src={form.logo} alt="" />
          ) : null}

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
            {item.logo ? <img src={item.logo} alt="" /> : <div />}
            <div>
              <p className="admin-news-list__meta">
                #{item.sortOrder}
                {!item.published ? ' · скрыт' : ''}
                {item.filter ? ` · фильтр: ${item.filter}` : ''}
              </p>
              <h3>{item.name}</h3>
              <p>
                {item.website
                  ? item.website.replace(/^https?:\/\//, '').replace(/\/$/, '')
                  : 'сайт не указан'}
              </p>
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
          <p className="admin__loading">Брендов пока нет</p>
        ) : null}
      </div>
    </section>
  )
}
