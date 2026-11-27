import { useState } from 'react'
import { api } from '../api'
import { filterProducts } from '../catalog/catalog'
import { FEATURED_COUNT, homeFeaturedPicks, setFeaturedPicks } from '../data/home'
import { products } from '../data/products'
import { rooms } from '../data/rooms'
import { resolveBrandName } from '../lib/catalog'
import type { AdminMessage } from './adminListStore'
import { explainError } from './adminUpload'
import type { Product } from '../types'
import { AdminIconButton } from './AdminIconButton'

const KEY = 'home.featured.picks'

/** Адрес товара из вставленной ссылки: …/product/slug или просто slug */
function slugFromLink(text: unknown) {
  const value = String(text || '').trim()
  const match = value.match(/\/product\/([a-z0-9-]+)/i)
  return (match ? match[1] : value.replace(/^\/+|\/+$/g, '')).toLowerCase()
}

/**
 * «По комнатам» на главной: товары для каждой комнаты по ссылкам из
 * вкладки «Товары». Пусто — блок выбирает модели комнаты сам.
 */
export default function AdminFeaturedPicker({
  onMessage,
  onChanged,
}: {
  onMessage: (message: AdminMessage) => void
  onChanged: () => void
}) {
  const [room, setRoom] = useState(rooms[0]?.slug || '')
  const [picks, setPicks] = useState<Record<string, string[]>>(() => ({ ...homeFeaturedPicks }))
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)

  const bySlug = new Map(products.map((item) => [item.slug, item]))
  const chosen = picks[room] || []
  const auto = (filterProducts(products, { room }) as Product[]).slice(0, FEATURED_COUNT)
  /* текущие товары комнаты — выбранные или автоматические; правятся одинаково */
  const isAuto = chosen.length === 0
  const current = isAuto ? auto.map((item) => item.slug) : chosen

  async function save(next: Record<string, string[]>) {
    setBusy(true)
    const cleaned = Object.fromEntries(Object.entries(next).filter(([, list]) => list.length))
    try {
      if (Object.keys(cleaned).length) {
        await api(`/api/content/${KEY}`, {
          method: 'PUT',
          body: JSON.stringify({ value: JSON.stringify(cleaned) }),
        })
      } else {
        await api(`/api/content/${KEY}`, { method: 'DELETE' })
      }
      setFeaturedPicks(cleaned)
      setPicks(cleaned)
      onChanged()
      onMessage({ ok: 'Товары блока «По комнатам» сохранены' })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить товары') })
    } finally {
      setBusy(false)
    }
  }

  function setRoomList(list: string[]) {
    void save({ ...picks, [room]: list })
  }

  function add() {
    const slug = slugFromLink(link)
    if (!slug) return
    if (!bySlug.has(slug)) {
      onMessage({
        error: `Товар не найден: «${link.trim()}». Скопируйте ссылку во вкладке «Товары».`,
      })
      return
    }
    if (current.includes(slug)) {
      onMessage({ error: 'Этот товар уже есть в комнате' })
      return
    }
    if (current.length >= FEATURED_COUNT) {
      onMessage({
        error: `В комнате показывается не больше ${FEATURED_COUNT} товаров — уберите один`,
      })
      return
    }
    setLink('')
    setRoomList([...current, slug])
  }

  function move(index: number, delta: number) {
    const next = [...current]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setRoomList(next)
  }

  const renderItem = (product: Product) => (
    <>
      {product.image ? <img src={product.image} alt="" /> : <span className="admin-pick__noimg" />}
      <span className="admin-pick__name">
        <strong>{product.name}</strong>
        <span>{resolveBrandName(product)}</span>
      </span>
    </>
  )

  return (
    <section className="admin-field admin-pick">
      <h3>Товары в комнатах</h3>
      <p className="admin-field__hint">
        {`В комнате ${FEATURED_COUNT} товара. Уберите лишний (×), вставьте ссылку на другой из вкладки «Товары», порядок — стрелками.`}
      </p>

      <select value={room} onChange={(e) => setRoom(e.target.value)} aria-label="Комната">
        {rooms.map((item) => (
          <option key={item.slug} value={item.slug}>
            {`${item.label}${picks[item.slug]?.length ? ` · выбрано ${picks[item.slug].length}` : ''}`}
          </option>
        ))}
      </select>

      {isAuto && current.length ? (
        <p className="admin-field__hint">
          Сейчас товары подобраны автоматически — любое изменение закрепит ваш список.
        </p>
      ) : null}

      <ol className="admin-pick__list">
        {current.map((slug, index) => {
          const product = bySlug.get(slug)
          return (
            <li key={slug}>
              {product ? (
                renderItem(product)
              ) : (
                <span className="admin-pick__name">{`Нет товара «${slug}»`}</span>
              )}
              <span className="admin-pick__tools">
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
                  disabled={busy || index === current.length - 1}
                  aria-label="Ниже"
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
                <AdminIconButton
                  icon="delete"
                  size="sm"
                  disabled={busy || current.length === 1}
                  label="Убрать"
                  title={
                    current.length === 1 ? 'В комнате должен остаться хотя бы один товар' : 'Убрать'
                  }
                  onClick={() => setRoomList(current.filter((item) => item !== slug))}
                />
              </span>
            </li>
          )
        })}
        {/* свободные места до четырёх */}
        {Array.from({ length: Math.max(0, FEATURED_COUNT - current.length) }, (_, i) => (
          <li key={`empty-${i}`} className="admin-pick__empty">
            Свободное место — вставьте ссылку ниже
          </li>
        ))}
      </ol>

      <form
        className="admin-pick__add"
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <input
          type="text"
          value={link}
          placeholder="Ссылка на товар"
          disabled={busy || current.length >= FEATURED_COUNT}
          onChange={(e) => setLink(e.target.value)}
        />
        <button type="submit" className="admin-field__save" disabled={busy || !link.trim()}>
          Добавить
        </button>
      </form>

      {!isAuto ? (
        <button
          type="button"
          className="admin__ghost"
          disabled={busy}
          onClick={() => setRoomList([])}
        >
          Вернуть автоматический выбор
        </button>
      ) : null}
    </section>
  )
}
