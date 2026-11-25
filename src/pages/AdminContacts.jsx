import { useEffect, useState } from 'react'
import { api } from '../api'
import { useContent } from '../content/ContentContext'
import {
  CONTACT_TYPES,
  applyContactsList,
  applyShowroomsList,
  contactTypeLabel,
  mapSrcFor,
  showroomsCodeList,
} from '../data/contactsRuntime'
import { explainError, uploadAdminFile } from './adminUpload'
import { FrameButton } from './AdminFrame'
import { FRAMES } from './adminFrames'
import './AdminEditor.css'

const CONTACTS_KEY = 'contacts.list'
const SHOWROOMS_KEY = 'showrooms.list'

/** «[Телефон]» и пустое — не настоящие значения */
const real = (value) => {
  const v = String(value || '').trim()
  return v && !/^\[[^\]]+\]$/.test(v) ? v : ''
}

function moved(list, index, delta) {
  const target = index + delta
  if (target < 0 || target >= list.length) return list
  const next = [...list]
  ;[next[index], next[target]] = [next[target], next[index]]
  return next
}

async function loadValue(key) {
  const data = await api('/api/content')
  const raw = data.values?.[key]
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function OrderTools({ index, total, busy, onMove, onRemove, removeLabel }) {
  return (
    <span className="admin-pick__tools">
      <button
        type="button"
        disabled={busy || index === 0}
        aria-label="Выше"
        onClick={() => onMove(-1)}
      >
        ↑
      </button>
      <button
        type="button"
        disabled={busy || index === total - 1}
        aria-label="Ниже"
        onClick={() => onMove(1)}
      >
        ↓
      </button>
      <button type="button" disabled={busy} aria-label={removeLabel} onClick={onRemove}>
        ×
      </button>
    </span>
  )
}

/**
 * Контакты: телефоны, почты, WhatsApp, адреса, часы — сколько нужно.
 * Первый телефон, почта, WhatsApp, адрес и часы идут в шапку, подвал и кнопки WhatsApp.
 */
export function ContactsEditor({ onMessage, onChanged = () => {} }) {
  const { content, setManyTexts } = useContent()
  const [list, setList] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    loadValue(CONTACTS_KEY)
      .then((saved) => {
        if (Array.isArray(saved)) {
          setList(saved)
          return
        }
        /* первый раз — из текущих контактов сайта */
        const c = content.contacts || {}
        const start = [
          ['phone', c.phone],
          ['email', c.email],
          ['whatsapp', c.whatsapp],
          ['address', c.address],
          ['hours', c.hours],
        ]
          .map(([type, value]) => ({ type, label: '', value: real(value) }))
          .filter((item) => item.value)
        setList(start.length ? start : [{ type: 'phone', label: '', value: '' }])
      })
      .catch((err) => onMessage({ error: explainError(err, 'Не удалось загрузить контакты') }))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- один раз при открытии
  }, [])

  if (!list) return <p className="admin__loading">Загрузка контактов…</p>

  const change = (next) => {
    setList(next)
    setDirty(true)
  }

  async function save() {
    const cleaned = list
      .filter((item) => item.value.trim())
      .map((item) => ({
        type: item.type,
        ...(item.label?.trim() ? { label: item.label.trim() } : {}),
        value: item.value.trim(),
      }))
    const first = (type) => cleaned.find((item) => item.type === type)?.value || ''
    setBusy(true)
    try {
      await api(`/api/content/${CONTACTS_KEY}`, {
        method: 'PUT',
        body: JSON.stringify({ value: JSON.stringify(cleaned) }),
      })
      /* шапка, подвал и WhatsApp — первые значения каждого типа */
      await setManyTexts({
        'contacts.phone': first('phone'),
        'contacts.email': first('email'),
        'contacts.whatsapp': first('whatsapp') || first('phone'),
        'contacts.address': first('address'),
        'contacts.hours': first('hours'),
      })
      applyContactsList(cleaned)
      setList(cleaned.length ? cleaned : [{ type: 'phone', label: '', value: '' }])
      setDirty(false)
      onChanged()
      onMessage({ ok: 'Контакты сохранены' })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить контакты') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin-field admin-contacts">
      <h3>Контакты</h3>
      <p className="admin-field__hint">
        Сколько угодно телефонов, почт и адресов. Первые телефон, почта и WhatsApp — в шапке,
        подвале и кнопках «Написать в WhatsApp».
      </p>
      <ol className="admin-contacts__list">
        {list.map((item, index) => {
          const type = CONTACT_TYPES.find((t) => t.type === item.type) || CONTACT_TYPES[0]
          return (
            <li key={index} className="admin-contact">
              <select
                value={item.type}
                aria-label="Тип контакта"
                onChange={(e) =>
                  change(
                    list.map((row, i) => (i === index ? { ...row, type: e.target.value } : row)),
                  )
                }
              >
                {CONTACT_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input
                className="admin-contact__value"
                value={item.value}
                placeholder={type.placeholder}
                aria-label="Значение"
                onChange={(e) =>
                  change(
                    list.map((row, i) => (i === index ? { ...row, value: e.target.value } : row)),
                  )
                }
              />
              <input
                className="admin-contact__label"
                value={item.label || ''}
                placeholder={`Подпись: ${contactTypeLabel(item.type)}`}
                aria-label="Подпись на сайте"
                onChange={(e) =>
                  change(
                    list.map((row, i) => (i === index ? { ...row, label: e.target.value } : row)),
                  )
                }
              />
              <OrderTools
                index={index}
                total={list.length}
                busy={busy}
                removeLabel="Удалить контакт"
                onMove={(delta) => change(moved(list, index, delta))}
                onRemove={() => change(list.filter((_, i) => i !== index))}
              />
            </li>
          )
        })}
      </ol>
      <div className="admin-authors__actions">
        <button
          type="button"
          className="admin__ghost"
          onClick={() => change([...list, { type: 'phone', label: '', value: '' }])}
        >
          + Контакт
        </button>
        <button
          type="button"
          className="admin-field__save"
          disabled={busy || !dirty}
          onClick={() => void save()}
        >
          {busy ? 'Сохранение…' : 'Сохранить контакты'}
        </button>
      </div>
    </section>
  )
}

const emptyShowroom = () => ({
  slug: `showroom-${Date.now().toString(36)}`,
  name: '',
  city: '',
  address: '',
  hours: '',
  phone: '',
  image: '',
  map: '',
  published: true,
})

/**
 * Шоурумы: название, город, адрес, часы, телефон, фото и карта.
 * Карта строится по адресу сама; можно вставить свою ссылку на Яндекс.Карты.
 */
export function ShowroomsEditor({ onMessage, onChanged = () => {} }) {
  const [list, setList] = useState(null)
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(0)

  useEffect(() => {
    loadValue(SHOWROOMS_KEY)
      .then((saved) => setList(Array.isArray(saved) ? saved : showroomsCodeList()))
      .catch((err) => onMessage({ error: explainError(err, 'Не удалось загрузить шоурумы') }))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- один раз при открытии
  }, [])

  if (!list) return <p className="admin__loading">Загрузка шоурумов…</p>

  const change = (next) => {
    setList(next)
    setDirty(true)
  }
  const update = (index, patch) =>
    change(list.map((row, i) => (i === index ? { ...row, ...patch } : row)))

  async function uploadPhoto(index, file) {
    setBusy(true)
    try {
      update(index, { image: await uploadAdminFile(file) })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось загрузить фото') })
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    const cleaned = list.filter((item) => item.name.trim())
    setBusy(true)
    try {
      await api(`/api/content/${SHOWROOMS_KEY}`, {
        method: 'PUT',
        body: JSON.stringify({ value: JSON.stringify(cleaned) }),
      })
      applyShowroomsList(cleaned)
      setList(cleaned)
      setDirty(false)
      onChanged()
      const incomplete = cleaned.filter(
        (item) => item.published !== false && !(item.address && item.hours && item.image),
      ).length
      onMessage({
        ok: incomplete
          ? `Шоурумы сохранены. Без адреса, часов или фото не попадут на главную: ${incomplete}`
          : 'Шоурумы сохранены',
      })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить шоурумы') })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin-field admin-showrooms">
      <h3>Шоурумы</h3>
      <p className="admin-field__hint">
        Показываются на странице «Шоурумы», в контактах и в записи на визит. Карта строится по
        адресу.
      </p>

      {list.map((item, index) => {
        const mapSrc = mapSrcFor(item)
        const isOpen = open === index
        const missing = [
          !item.address && 'адрес',
          !item.hours && 'часы',
          !item.image && 'фото',
        ].filter(Boolean)
        return (
          <article
            key={item.slug}
            className={['admin-showroom', isOpen ? 'is-open' : ''].filter(Boolean).join(' ')}
          >
            <header className="admin-showroom__head">
              <button
                type="button"
                className="admin-showroom__toggle"
                onClick={() => setOpen(isOpen ? -1 : index)}
              >
                {item.image ? (
                  <img src={item.image} alt="" />
                ) : (
                  <span className="admin-pick__noimg" />
                )}
                <span className="admin-pick__name">
                  <strong>{item.name || 'Новый шоурум'}</strong>
                  <span>
                    {[item.city, item.address].filter(Boolean).join(', ') || 'адрес не указан'}
                    {item.published === false ? ' · скрыт' : ''}
                  </span>
                </span>
                <span className="admin-showroom__chevron" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              <OrderTools
                index={index}
                total={list.length}
                busy={busy}
                removeLabel="Удалить шоурум"
                onMove={(delta) => {
                  change(moved(list, index, delta))
                  setOpen(-1)
                }}
                onRemove={() => {
                  if (window.confirm(`Удалить шоурум «${item.name || 'без названия'}»?`)) {
                    change(list.filter((_, i) => i !== index))
                    setOpen(-1)
                  }
                }}
              />
            </header>

            {isOpen ? (
              <div className="admin-showroom__body">
                <div className="admin-media">
                  <label className="admin-photo admin-showroom__photo">
                    {item.image ? <img src={item.image} alt="" /> : null}
                    <span className="admin-photo__over">
                      {item.image ? 'Заменить фото' : 'Загрузить фото'}
                    </span>
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
                    src={item.image}
                    aspects={FRAMES.card32}
                    disabled={busy}
                    onChange={(image) => update(index, { image })}
                  />
                </div>

                <div className="admin-showroom__fields">
                  <label>
                    Название
                    <input
                      value={item.name}
                      placeholder="ID Gallery на Абая"
                      onChange={(e) => update(index, { name: e.target.value })}
                    />
                  </label>
                  <label>
                    Город
                    <input
                      value={item.city}
                      placeholder="Алматы"
                      onChange={(e) => update(index, { city: e.target.value })}
                    />
                  </label>
                  <label className="is-wide">
                    Адрес
                    <input
                      value={item.address}
                      placeholder="улица, дом, этаж"
                      onChange={(e) => update(index, { address: e.target.value })}
                    />
                  </label>
                  <label>
                    Часы работы
                    <input
                      value={item.hours}
                      placeholder="Пн–Сб 10:00–20:00"
                      onChange={(e) => update(index, { hours: e.target.value })}
                    />
                  </label>
                  <label>
                    Телефон
                    <input
                      value={item.phone || ''}
                      placeholder="+7 700 000 00 00"
                      onChange={(e) => update(index, { phone: e.target.value })}
                    />
                  </label>
                  <label className="is-wide">
                    Своя ссылка на Яндекс.Карты (необязательно)
                    <input
                      value={item.map || ''}
                      placeholder="https://yandex.kz/maps/… — если карта по адресу неточная"
                      onChange={(e) => update(index, { map: e.target.value })}
                    />
                  </label>
                  <label className="admin-check is-wide">
                    <input
                      type="checkbox"
                      checked={item.published !== false}
                      onChange={(e) => update(index, { published: e.target.checked })}
                    />
                    Показывать на сайте
                  </label>
                  {missing.length ? (
                    <p className="admin-author__warn is-wide">{`Для главной не хватает: ${missing.join(', ')}`}</p>
                  ) : null}
                </div>

                <div className="admin-showroom__map">
                  {mapSrc ? (
                    <iframe title={`Карта: ${item.name}`} src={mapSrc} loading="lazy" />
                  ) : (
                    <span>Укажите город и адрес — карта появится здесь</span>
                  )}
                </div>
              </div>
            ) : null}
          </article>
        )
      })}

      <div className="admin-authors__actions">
        <button
          type="button"
          className="admin__ghost"
          onClick={() => {
            change([...list, emptyShowroom()])
            setOpen(list.length)
          }}
        >
          + Шоурум
        </button>
        <button
          type="button"
          className="admin-field__save"
          disabled={busy || !dirty}
          onClick={() => void save()}
        >
          {busy ? 'Сохранение…' : 'Сохранить шоурумы'}
        </button>
      </div>
    </section>
  )
}

/** Вкладка «Контакты и шоурумы» */
export default function AdminContacts({ onMessage }) {
  return (
    <div className="admin-product admin-contacts-page">
      <ContactsEditor onMessage={onMessage} />
      <ShowroomsEditor onMessage={onMessage} />
    </div>
  )
}
