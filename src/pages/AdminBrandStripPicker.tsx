import { useState, type FormEvent } from 'react'
import { api } from '../api'
import { brands } from '../data/brands'
import { type BrandStripItem, homeBrandStrip, setBrandStrip } from '../data/home'
import type { AdminMessage } from './adminListStore'
import { explainError } from './adminUpload'
import { AdminIconButton } from './AdminIconButton'

const KEY = 'home.brands.strip'

/**
 * Полоса брендов под баннером «Бренды» на главной: какие бренды показывать,
 * в каком порядке; можно добавить бренд из каталога или свой пункт со ссылкой.
 * Пока список не меняли — показываются все бренды каталога.
 */
export default function AdminBrandStripPicker({
  onMessage,
  onChanged,
}: {
  onMessage: (message: AdminMessage) => void
  onChanged: () => void
}) {
  const bySlug = new Map(brands.map((brand) => [brand.slug, brand]))
  const [items, setItems] = useState<BrandStripItem[]>(
    () => homeBrandStrip.items ?? brands.map((brand) => ({ slug: brand.slug })),
  )
  const [isAuto, setIsAuto] = useState(homeBrandStrip.items === null)
  const [busy, setBusy] = useState(false)
  const [addSlug, setAddSlug] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [customHref, setCustomHref] = useState('')

  const missing = brands.filter((brand) => !items.some((item) => item.slug === brand.slug))

  async function save(next: BrandStripItem[]) {
    setBusy(true)
    try {
      await api(`/api/content/${KEY}`, {
        method: 'PUT',
        body: JSON.stringify({ value: JSON.stringify(next) }),
      })
      setBrandStrip(next)
      setItems(next)
      setIsAuto(false)
      onChanged()
      onMessage({ ok: 'Бренды в полосе сохранены' })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить бренды') })
    } finally {
      setBusy(false)
    }
  }

  async function reset() {
    setBusy(true)
    try {
      await api(`/api/content/${KEY}`, { method: 'DELETE' })
      setBrandStrip(null)
      setItems(brands.map((brand) => ({ slug: brand.slug })))
      setIsAuto(true)
      onChanged()
      onMessage({ ok: 'Показываются все бренды каталога' })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сбросить') })
    } finally {
      setBusy(false)
    }
  }

  function move(index: number, delta: number) {
    const next = [...items]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    void save(next)
  }

  function addBrand() {
    if (!addSlug) return
    setAddSlug('')
    void save([...items, { slug: addSlug }])
  }

  function addCustom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const label = customLabel.trim()
    let href = customHref.trim()
    if (!label || !href) {
      onMessage({ error: 'Для своего пункта нужны название и ссылка' })
      return
    }
    /* ссылка на страницу сайта или полный адрес */
    if (!/^(https?:\/\/|\/)/.test(href)) href = `https://${href}`
    setCustomLabel('')
    setCustomHref('')
    void save([...items, { label, href }])
  }

  return (
    <section className="admin-field admin-pick">
      <h3>Бренды под баннером</h3>
      <p className="admin-field__hint">
        Порядок — стрелками, × убирает бренд из полосы (страница бренда остаётся).
      </p>
      {isAuto ? (
        <p className="admin-field__hint">
          Сейчас показываются все бренды каталога — любое изменение закрепит ваш список.
        </p>
      ) : null}

      <ol className="admin-pick__list">
        {items.map((item, index) => {
          const brand = item.slug ? bySlug.get(item.slug) : null
          return (
            <li key={`${item.slug || item.href}-${index}`} className="admin-pick__row">
              {brand?.logo ? (
                <img src={brand.logo} alt="" className="admin-pick__logo" />
              ) : (
                <span className="admin-pick__noimg" />
              )}
              <span className="admin-pick__name">
                <strong>{brand ? brand.name : item.label || item.slug}</strong>
                <span>{brand ? `/brands/${brand.slug}` : item.href || 'бренд не найден'}</span>
              </span>
              <span className="admin-pick__tools">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  aria-label="Левее"
                  onClick={() => move(index, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={busy || index === items.length - 1}
                  aria-label="Правее"
                  onClick={() => move(index, 1)}
                >
                  ↓
                </button>
                <AdminIconButton
                  icon="delete"
                  size="sm"
                  disabled={busy}
                  label="Убрать из полосы"
                  onClick={() => void save(items.filter((_, i) => i !== index))}
                />
              </span>
            </li>
          )
        })}
        {items.length === 0 ? (
          <li className="admin-pick__empty">Полоса брендов скрыта — добавьте бренд ниже</li>
        ) : null}
      </ol>

      {missing.length ? (
        <div className="admin-pick__add">
          <select
            value={addSlug}
            onChange={(e) => setAddSlug(e.target.value)}
            aria-label="Бренд из каталога"
          >
            <option value="">Добавить бренд из каталога…</option>
            {missing.map((brand) => (
              <option key={brand.slug} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="admin-field__save"
            disabled={busy || !addSlug}
            onClick={addBrand}
          >
            Добавить
          </button>
        </div>
      ) : null}

      <form className="admin-pick__custom" onSubmit={addCustom}>
        <span className="admin-field__hint">Свой пункт — бренд без страницы на сайте:</span>
        <input
          type="text"
          value={customLabel}
          placeholder="Название, например Minotti"
          onChange={(e) => setCustomLabel(e.target.value)}
        />
        <div className="admin-pick__add">
          <input
            type="text"
            value={customHref}
            placeholder="Ссылка: /catalog?brand=… или https://…"
            onChange={(e) => setCustomHref(e.target.value)}
          />
          <button
            type="submit"
            className="admin-field__save"
            disabled={busy || !customLabel.trim() || !customHref.trim()}
          >
            Добавить
          </button>
        </div>
      </form>

      {!isAuto ? (
        <button type="button" className="admin__ghost" disabled={busy} onClick={() => void reset()}>
          Показывать все бренды каталога
        </button>
      ) : null}
    </section>
  )
}
