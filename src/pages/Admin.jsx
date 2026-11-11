import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { useContent } from '../content/ContentContext'
import { useMedia } from '../media/MediaContext'
import { useBrands } from '../brands/BrandsContext'
import { useNews } from '../news/NewsContext'
import AdminBrands from './AdminBrands'
import AdminNews from './AdminNews'
import './Admin.css'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState('media')
  const [busy, setBusy] = useState(null)
  const [actionError, setActionError] = useState('')
  const [actionOk, setActionOk] = useState('')
  const [drafts, setDrafts] = useState({})
  const [textDrafts, setTextDrafts] = useState({})
  const { slots, media, urls, defaults, setUrl, uploadFile, resetSlot, resetAll, ready } =
    useMedia()
  const {
    slots: textSlots,
    texts,
    defaults: textDefaults,
    setManyTexts,
    resetText,
    resetAllTexts,
    ready: textsReady,
  } = useContent()
  const { reload: reloadNews } = useNews()
  const { reload: reloadBrands } = useBrands()

  const images = useMemo(() => slots.filter((s) => s.kind === 'image'), [slots])
  const videos = useMemo(() => slots.filter((s) => s.kind === 'video'), [slots])

  const textGroups = useMemo(() => {
    const map = new Map()
    for (const slot of textSlots) {
      if (!map.has(slot.group)) map.set(slot.group, [])
      map.get(slot.group).push(slot)
    }
    return [...map.entries()]
  }, [textSlots])

  const dirtyTexts = Object.keys(textDrafts).length > 0

  useEffect(() => {
    api('/api/auth/me')
      .then((data) => setAuthed(Boolean(data.authed)))
      .catch(() => setAuthed(false))
      .finally(() => setAuthChecked(true))
  }, [])

  useEffect(() => {
    if (!dirtyTexts) return undefined
    const onBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirtyTexts])

  async function login(event) {
    event.preventDefault()
    setError('')
    try {
      await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login: loginValue.trim(), password }),
      })
      setAuthed(true)
      setPassword('')
    } catch (err) {
      setError(err?.message || 'Неверный логин или пароль')
    }
  }

  async function logout() {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch {
      /* ignore */
    }
    setAuthed(false)
    setLoginValue('')
    setPassword('')
  }

  if (!authChecked) {
    return (
      <div className="admin">
        <p className="admin__loading">Проверка сессии…</p>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="admin">
        <form className="admin__login" onSubmit={login}>
          <h1>Админка ID Gallery</h1>
          <p>Медиа, тексты, новости и бренды · PostgreSQL</p>
          <label>
            Логин
            <input
              type="text"
              name="username"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="admin__error">{error}</p> : null}
          <button type="submit">Войти</button>
          <Link to="/">← На сайт</Link>
        </form>
      </div>
    )
  }

  async function applyUrl(id) {
    setBusy(id)
    setActionError('')
    setActionOk('')
    try {
      const value = (drafts[id] ?? urls[id] ?? '').trim()
      await setUrl(id, value)
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (err) {
      setActionError(err?.message || 'Не удалось сохранить URL')
    } finally {
      setBusy(null)
    }
  }

  async function onFile(id, file) {
    if (!file) return
    setBusy(id)
    setActionError('')
    setActionOk('')
    try {
      await uploadFile(id, file)
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (err) {
      setActionError(err?.message || 'Не удалось загрузить файл')
    } finally {
      setBusy(null)
    }
  }

  async function onReset(id) {
    setBusy(id)
    setActionError('')
    setActionOk('')
    try {
      await resetSlot(id)
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (err) {
      setActionError(err?.message || 'Не удалось сбросить слот')
    } finally {
      setBusy(null)
    }
  }

  async function saveTexts() {
    setActionError('')
    setActionOk('')
    try {
      await setManyTexts(textDrafts)
      setTextDrafts({})
      setActionOk('Тексты сохранены в PostgreSQL')
    } catch (err) {
      setActionError(err?.message || 'Не удалось сохранить тексты')
    }
  }

  function goSite(event) {
    if (!dirtyTexts) return
    if (!window.confirm('Есть несохранённые тексты. Уйти без сохранения?')) {
      event.preventDefault()
    }
  }

  return (
    <div className="admin">
      <header className="admin__header">
        <div>
          <h1>Админка</h1>
          <p>
            Тексты, медиа, новости и бренды хранятся в PostgreSQL; файлы — в
            папке uploads на сервере.
          </p>
        </div>
        <div className="admin__actions">
          <Link to="/" onClick={goSite}>
            Открыть сайт
          </Link>
          <button type="button" onClick={logout}>
            Выйти
          </button>
        </div>
      </header>

      <div className="admin__tabs" role="tablist" aria-label="Разделы админки">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'media'}
          className={tab === 'media' ? 'is-active' : ''}
          onClick={() => {
            setTab('media')
            setActionOk('')
            setActionError('')
          }}
        >
          Медиа
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'texts'}
          className={tab === 'texts' ? 'is-active' : ''}
          onClick={() => {
            setTab('texts')
            setActionOk('')
            setActionError('')
          }}
        >
          Тексты
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'news'}
          className={tab === 'news' ? 'is-active' : ''}
          onClick={() => {
            setTab('news')
            setActionOk('')
            setActionError('')
          }}
        >
          События
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'brands'}
          className={tab === 'brands' ? 'is-active' : ''}
          onClick={() => {
            setTab('brands')
            setActionOk('')
            setActionError('')
          }}
        >
          Бренды
        </button>
      </div>

      {actionError ? <p className="admin__error admin__banner">{actionError}</p> : null}
      {actionOk ? <p className="admin__ok admin__banner">{actionOk}</p> : null}

      {tab === 'media' ? (
        <>
          <div className="admin__toolbar">
            <button
              type="button"
              className="admin__danger"
              disabled={!!busy}
              onClick={async () => {
                if (!window.confirm('Сбросить все медиа к исходным?')) return
                setBusy('all')
                setActionError('')
                setActionOk('')
                try {
                  await resetAll()
                  setDrafts({})
                  setActionOk('Медиа сброшены')
                } catch (err) {
                  setActionError(err?.message || 'Не удалось сбросить')
                } finally {
                  setBusy(null)
                }
              }}
            >
              Сбросить все медиа
            </button>
          </div>

          {!ready ? <p className="admin__loading">Загрузка…</p> : null}

          <section className="admin__section">
            <h2>Изображения</h2>
            <div className="admin__grid">
              {images.map((slot) => (
                <MediaCard
                  key={slot.id}
                  slot={slot}
                  src={media[slot.id]}
                  draft={drafts[slot.id] ?? urls[slot.id] ?? ''}
                  placeholder={defaults[slot.id]}
                  busy={busy === slot.id}
                  onDraft={(value) =>
                    setDrafts((prev) => ({ ...prev, [slot.id]: value }))
                  }
                  onApply={() => applyUrl(slot.id)}
                  onFile={(file) => onFile(slot.id, file)}
                  onReset={() => onReset(slot.id)}
                />
              ))}
            </div>
          </section>

          <section className="admin__section">
            <h2>Видео</h2>
            <div className="admin__grid">
              {videos.map((slot) => (
                <MediaCard
                  key={slot.id}
                  slot={slot}
                  src={media[slot.id]}
                  draft={drafts[slot.id] ?? urls[slot.id] ?? ''}
                  placeholder={defaults[slot.id]}
                  busy={busy === slot.id}
                  onDraft={(value) =>
                    setDrafts((prev) => ({ ...prev, [slot.id]: value }))
                  }
                  onApply={() => applyUrl(slot.id)}
                  onFile={(file) => onFile(slot.id, file)}
                  onReset={() => onReset(slot.id)}
                />
              ))}
            </div>
          </section>
        </>
      ) : null}

      {tab === 'texts' ? (
        <>
          <div className="admin__toolbar">
            <button type="button" disabled={!dirtyTexts} onClick={saveTexts}>
              Сохранить тексты
            </button>
            <button
              type="button"
              className="admin__danger"
              onClick={async () => {
                if (!window.confirm('Сбросить все тексты к исходным?')) return
                setActionError('')
                try {
                  await resetAllTexts()
                  setTextDrafts({})
                  setActionOk('Тексты сброшены')
                } catch (err) {
                  setActionError(err?.message || 'Не удалось сбросить тексты')
                }
              }}
            >
              Сбросить все тексты
            </button>
            {dirtyTexts ? (
              <span className="admin__dirty">Есть несохранённые изменения</span>
            ) : null}
          </div>

          {!textsReady ? <p className="admin__loading">Загрузка текстов…</p> : null}

          {textGroups.map(([group, groupSlots]) => (
            <section key={group} className="admin__section">
              <h2>{group}</h2>
              <div className="admin__text-list">
                {groupSlots.map((slot) => {
                  const value =
                    textDrafts[slot.id] !== undefined
                      ? textDrafts[slot.id]
                      : texts[slot.id]
                  const changed = value !== textDefaults[slot.id]
                  return (
                    <label key={slot.id} className="admin-text">
                      <span className="admin-text__label">
                        {slot.label}
                        {changed ? <em>изменено</em> : null}
                      </span>
                      {slot.multiline ? (
                        <textarea
                          rows={4}
                          value={value}
                          onChange={(e) =>
                            setTextDrafts((prev) => ({
                              ...prev,
                              [slot.id]: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            setTextDrafts((prev) => ({
                              ...prev,
                              [slot.id]: e.target.value,
                            }))
                          }
                        />
                      )}
                      <button
                        type="button"
                        className="admin-text__reset"
                        disabled={!changed && textDrafts[slot.id] === undefined}
                        onClick={async () => {
                          const draft = textDrafts[slot.id]
                          const saved = texts[slot.id]
                          if (draft !== undefined && draft !== saved) {
                            setTextDrafts((prev) => {
                              const next = { ...prev }
                              delete next[slot.id]
                              return next
                            })
                            return
                          }
                          setActionError('')
                          try {
                            await resetText(slot.id)
                            setTextDrafts((prev) => {
                              const next = { ...prev }
                              delete next[slot.id]
                              return next
                            })
                          } catch (err) {
                            setActionError(err?.message || 'Не удалось сбросить поле')
                          }
                        }}
                      >
                        {textDrafts[slot.id] !== undefined &&
                        textDrafts[slot.id] !== texts[slot.id]
                          ? 'Отменить'
                          : 'Сброс'}
                      </button>
                    </label>
                  )
                })}
              </div>
            </section>
          ))}
        </>
      ) : null}

      {tab === 'news' ? (
        <AdminNews
          onMessage={({ error = '', ok = '' } = {}) => {
            setActionError(error)
            setActionOk(ok)
          }}
          onChanged={reloadNews}
        />
      ) : null}

      {tab === 'brands' ? (
        <AdminBrands
          onMessage={({ error = '', ok = '' } = {}) => {
            setActionError(error)
            setActionOk(ok)
          }}
          onChanged={reloadBrands}
        />
      ) : null}
    </div>
  )
}

function MediaCard({
  slot,
  src,
  draft,
  placeholder,
  busy,
  onDraft,
  onApply,
  onFile,
  onReset,
}) {
  const accept = slot.kind === 'video' ? 'video/*' : 'image/*'

  return (
    <article className="admin-card">
      <h3>{slot.label}</h3>
      <div className="admin-card__preview">
        {slot.kind === 'video' ? (
          <video key={src} src={src} muted playsInline controls preload="metadata" />
        ) : (
          <img key={src} src={src} alt={slot.label} />
        )}
      </div>
      <label className="admin-card__file">
        Загрузить файл
        <input
          type="file"
          accept={accept}
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFile(file)
            e.target.value = ''
          }}
        />
      </label>
      <label>
        Или URL
        <input
          type="text"
          inputMode="url"
          value={draft}
          placeholder={placeholder}
          disabled={busy}
          onChange={(e) => onDraft(e.target.value)}
        />
      </label>
      <div className="admin-card__btns">
        <button type="button" disabled={busy} onClick={onApply}>
          Сохранить URL
        </button>
        <button type="button" disabled={busy} onClick={onReset}>
          Сброс
        </button>
      </div>
      {busy ? <p className="admin-card__busy">Сохранение…</p> : null}
    </article>
  )
}
