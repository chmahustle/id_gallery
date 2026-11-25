import { applyRoomsList, applyTypesList, codeRooms, codeTypes } from '../data/catalogRuntime'
import { categories } from '../data/categories'
import { products } from '../data/products'
import { moved, useStoredList } from './adminListStore'
import './AdminEditor.css'
import { slugify as toSlug } from './adminSlug'

const slugify = (text) => toSlug(text, { max: 40 })

const initialTypes = () =>
  codeTypes.map((item) => ({
    slug: item.slug,
    label: item.label,
    singular: item.singular || '',
    description: item.description || '',
  }))

const initialRooms = () =>
  codeRooms.map((item) => ({
    slug: item.slug,
    label: item.label,
    genitive: item.genitive,
    categorySlugs: [...item.categorySlugs],
  }))

/** Адрес нового элемента: из названия, без повторов; у сохранённых не меняется */
function withSlugs(list, saved) {
  const used = new Set()
  return list.map((item) => {
    let slug = item.slug || slugify(item.label) || `item-${Date.now().toString(36)}`
    if (!item.slug && saved.has(slug)) slug = `${slug}-2`
    while (used.has(slug)) slug = `${slug}-x`
    used.add(slug)
    return { ...item, slug }
  })
}

function Tools({ list, index, onChange, onRemove }) {
  return (
    <span className="admin-pick__tools">
      <button
        type="button"
        disabled={index === 0}
        aria-label="Выше"
        onClick={() => onChange(moved(list, index, -1))}
      >
        ↑
      </button>
      <button
        type="button"
        disabled={index === list.length - 1}
        aria-label="Ниже"
        onClick={() => onChange(moved(list, index, 1))}
      >
        ↓
      </button>
      <button type="button" aria-label="Удалить" onClick={onRemove}>
        ×
      </button>
    </span>
  )
}

/**
 * «Типы и комнаты»: типы мебели (Диваны, Кресла…) и комнаты (Гостиная…).
 * Новые типы сразу появляются в каталоге, меню «По типам» и карточке товара;
 * у комнаты отмечается, какие типы в ней показывать.
 */
export default function AdminTypesRooms({ onMessage }) {
  const types = useStoredList('catalog.types', initialTypes, {
    onMessage,
    okText: 'Типы сохранены',
    onSaved: (value) => applyTypesList(value || initialTypes()),
  })
  const roomsStore = useStoredList('catalog.rooms', initialRooms, {
    onMessage,
    okText: 'Комнаты сохранены',
    onSaved: (value) => applyRoomsList(value || initialRooms()),
  })

  if (!types.list || !roomsStore.list) return <p className="admin__loading">Загрузка…</p>

  const countOf = (slug) => products.filter((item) => item.categorySlug === slug).length
  const savedTypeSlugs = new Set(categories.map((item) => item.slug))
  const updateType = (index, patch) =>
    types.change(types.list.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  const updateRoom = (index, patch) =>
    roomsStore.change(
      roomsStore.list.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    )

  return (
    <div className="admin-product admin-types">
      <section className="admin-field">
        <h3>Типы мебели</h3>
        <p className="admin-field__hint">
          Название во множественном числе — в каталоге и меню, в единственном — в карточке товара
          («Диван»).
        </p>
        <div className="admin-types__head" aria-hidden="true">
          <span>Название</span>
          <span>Один предмет</span>
          <span>Текст в каталоге</span>
          <span />
        </div>
        {types.list.map((item, index) => {
          const count = item.slug ? countOf(item.slug) : 0
          return (
            <div key={item.slug || `new-${index}`} className="admin-types__row">
              <label>
                <input
                  value={item.label}
                  placeholder="Например, Ковры"
                  onChange={(e) => updateType(index, { label: e.target.value })}
                />
                <span className="admin-types__meta">
                  {item.slug ? `/catalog/${item.slug} · товаров: ${count}` : 'новый тип'}
                </span>
              </label>
              <input
                value={item.singular}
                placeholder="Ковёр"
                onChange={(e) => updateType(index, { singular: e.target.value })}
              />
              <input
                value={item.description}
                placeholder="Короткий текст под заголовком"
                onChange={(e) => updateType(index, { description: e.target.value })}
              />
              <Tools
                list={types.list}
                index={index}
                onChange={types.change}
                onRemove={() => {
                  const text = count
                    ? `Удалить тип «${item.label}»? У него ${count} товаров — смените им тип во вкладке «Товары», иначе они пропадут из каталога по типам.`
                    : `Удалить тип «${item.label}»?`
                  if (window.confirm(text)) types.change(types.list.filter((_, i) => i !== index))
                }}
              />
            </div>
          )
        })}
        <div className="admin-authors__actions">
          <button
            type="button"
            className="admin__ghost"
            onClick={() =>
              types.change([...types.list, { slug: '', label: '', singular: '', description: '' }])
            }
          >
            + Тип
          </button>
          <span>
            <button type="button" className="admin-field__link" onClick={() => void types.reset()}>
              Вернуть как было в коде
            </button>{' '}
            <button
              type="button"
              className="admin-field__save"
              disabled={types.busy || !types.dirty}
              onClick={() =>
                void types.save(
                  withSlugs(
                    types.list.filter((item) => item.label.trim()),
                    savedTypeSlugs,
                  ),
                )
              }
            >
              {types.busy ? 'Сохранение…' : 'Сохранить типы'}
            </button>
          </span>
        </div>
      </section>

      <section className="admin-field">
        <h3>Комнаты</h3>
        <p className="admin-field__hint">
          Отметьте типы, которые показывать в комнате. Если у товара свои комнаты (вкладка
          «Товары»), берутся они.
        </p>
        {roomsStore.list.map((room, index) => (
          <article key={room.slug || `new-${index}`} className="admin-room">
            <div className="admin-room__top">
              <input
                className="admin-author__name"
                value={room.label}
                placeholder="Например, Прихожая"
                onChange={(e) => updateRoom(index, { label: e.target.value })}
              />
              <input
                value={room.genitive}
                placeholder="Для кого: «прихожей»"
                title="«Все товары для …» — название в родительном падеже"
                onChange={(e) => updateRoom(index, { genitive: e.target.value })}
              />
              <Tools
                list={roomsStore.list}
                index={index}
                onChange={roomsStore.change}
                onRemove={() => {
                  if (window.confirm(`Удалить комнату «${room.label}»?`)) {
                    roomsStore.change(roomsStore.list.filter((_, i) => i !== index))
                  }
                }}
              />
            </div>
            <div className="admin-checks">
              {types.list
                .filter((type) => type.slug)
                .map((type) => (
                  <label key={type.slug} className="admin-check">
                    <input
                      type="checkbox"
                      checked={room.categorySlugs.includes(type.slug)}
                      onChange={(e) =>
                        updateRoom(index, {
                          categorySlugs: e.target.checked
                            ? [...room.categorySlugs, type.slug]
                            : room.categorySlugs.filter((slug) => slug !== type.slug),
                        })
                      }
                    />
                    {type.label}
                  </label>
                ))}
            </div>
          </article>
        ))}
        <div className="admin-authors__actions">
          <button
            type="button"
            className="admin__ghost"
            onClick={() =>
              roomsStore.change([
                ...roomsStore.list,
                { slug: '', label: '', genitive: '', categorySlugs: [] },
              ])
            }
          >
            + Комната
          </button>
          <span>
            <button
              type="button"
              className="admin-field__link"
              onClick={() => void roomsStore.reset()}
            >
              Вернуть как было в коде
            </button>{' '}
            <button
              type="button"
              className="admin-field__save"
              disabled={roomsStore.busy || !roomsStore.dirty}
              onClick={() =>
                void roomsStore.save(
                  withSlugs(
                    roomsStore.list.filter((item) => item.label.trim()),
                    new Set(codeRooms.map((item) => item.slug)),
                  ),
                )
              }
            >
              {roomsStore.busy ? 'Сохранение…' : 'Сохранить комнаты'}
            </button>
          </span>
        </div>
      </section>
    </div>
  )
}
