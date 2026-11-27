import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { api } from '../api'
import { useNews } from '../news/NewsContext'
import AdminBrandEditor from './AdminBrandEditor'
import AdminContacts from './AdminContacts'
import AdminContent from './AdminContent'
import AdminInteriors from './AdminInteriors'
import AdminNavigation from './AdminNavigation'
import AdminTypesRooms from './AdminTypesRooms'
import AdminProducts, { type ProductsIntent } from './AdminProducts'
import type { AdminMessage } from './adminListStore'
import AdminNews from './AdminNews'
import './Admin.css'

type TabId =
  'content' | 'products' | 'interiors' | 'types' | 'contacts' | 'navigation' | 'news' | 'brands'

const TABS: [TabId, string][] = [
  ['content', 'Тексты и фото'],
  ['products', 'Товары'],
  ['interiors', 'Интерьеры'],
  ['types', 'Типы и комнаты'],
  ['contacts', 'Контакты и шоурумы'],
  ['navigation', 'Меню и подвал'],
  ['news', 'События'],
  ['brands', 'Бренды'],
]

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<TabId>('content')
  /* переход из карточки бренда в «Товары»: открыть товар или новый товар бренда */
  const [productsIntent, setProductsIntent] = useState<ProductsIntent | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionOk, setActionOk] = useState('')
  const { reload: reloadNews } = useNews()
  /* один обработчик сообщений для вкладок; стабильная ссылка — без лишних загрузок */
  const onMessage = useCallback(({ error = '', ok = '' }: AdminMessage = {}) => {
    setActionError(error)
    setActionOk(ok)
  }, [])

  useEffect(() => {
    api<{ authed?: boolean }>('/api/auth/me')
      .then((data) => setAuthed(Boolean(data.authed)))
      .catch(() => setAuthed(false))
      .finally(() => setAuthChecked(true))
  }, [])

  async function login(event: FormEvent<HTMLFormElement>) {
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
      setError((err as Error)?.message || 'Неверный логин или пароль')
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

  return (
    <div className="admin">
      <header className="admin__header">
        <div>
          <h1>Админка</h1>
          <p>
            Тексты, медиа, новости и бренды хранятся в PostgreSQL; файлы — в папке uploads на
            сервере.
          </p>
        </div>
        <div className="admin__actions">
          <Link to="/">Открыть сайт</Link>
          <button type="button" onClick={logout}>
            Выйти
          </button>
        </div>
      </header>

      <div className="admin__tabs" role="tablist" aria-label="Разделы админки">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'is-active' : ''}
            onClick={() => {
              setTab(id)
              setActionOk('')
              setActionError('')
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {actionError ? <p className="admin__error admin__banner">{actionError}</p> : null}
      {actionOk ? <p className="admin__ok admin__banner">{actionOk}</p> : null}

      {tab === 'content' ? <AdminContent onMessage={onMessage} /> : null}

      {tab === 'products' ? (
        <AdminProducts
          onMessage={onMessage}
          intent={productsIntent}
          onIntentDone={() => setProductsIntent(null)}
        />
      ) : null}

      {tab === 'contacts' ? <AdminContacts onMessage={onMessage} /> : null}

      {tab === 'interiors' ? <AdminInteriors onMessage={onMessage} /> : null}

      {tab === 'navigation' ? <AdminNavigation onMessage={onMessage} /> : null}

      {tab === 'types' ? <AdminTypesRooms onMessage={onMessage} /> : null}

      {tab === 'news' ? <AdminNews onMessage={onMessage} onChanged={reloadNews} /> : null}

      {tab === 'brands' ? (
        <AdminBrandEditor
          onMessage={onMessage}
          onOpenProduct={(slug) => {
            setProductsIntent({ type: 'edit', slug })
            setTab('products')
          }}
          onNewProduct={(brandSlug) => {
            setProductsIntent({ type: 'new', brandSlug })
            setTab('products')
          }}
        />
      ) : null}
    </div>
  )
}
