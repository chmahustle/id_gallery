import { brands } from '../data/brands'
import {
  applyFooter,
  applyMenu,
  applyTopNav,
  footerHeadings,
  footerNav,
  navigation,
  topNav,
} from '../data/navigation'
import { PagesList } from './adminPages'
import { moved, useStoredList } from './adminListStore'
import './AdminEditor.css'

/* значения из кода — с них редактор начинает в первый раз */
const codeTop = topNav.map((item) => ({ ...item }))
const codeMenu = navigation.map((section) => ({
  title: section.title,
  href: section.href || '',
  links: section.links.map((link) => ({ ...link })),
  keep: section.title,
}))
const codeFooter = {
  catalog: { title: footerHeadings.catalog, links: footerNav.catalog.map((l) => ({ ...l })) },
  brands: { title: footerHeadings.brands },
  company: { title: footerHeadings.company, links: footerNav.company.map((l) => ({ ...l })) },
  services: { title: footerHeadings.services, links: footerNav.services.map((l) => ({ ...l })) },
}

/** Ссылки: название, адрес (с подсказкой страниц), порядок, удаление */
function LinksEditor({ links, onChange }) {
  const update = (index, patch) =>
    onChange(links.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  return (
    <div className="admin-links">
      {links.map((link, index) => (
        <div key={index} className="admin-links__row">
          <input
            value={link.label}
            placeholder="Название"
            aria-label="Название ссылки"
            onChange={(e) => update(index, { label: e.target.value })}
          />
          <input
            value={link.href}
            placeholder="/страница или https://…"
            list="admin-site-pages"
            aria-label="Адрес ссылки"
            onChange={(e) => update(index, { href: e.target.value })}
          />
          <span className="admin-pick__tools">
            <button
              type="button"
              disabled={index === 0}
              aria-label="Выше"
              onClick={() => onChange(moved(links, index, -1))}
            >
              ↑
            </button>
            <button
              type="button"
              disabled={index === links.length - 1}
              aria-label="Ниже"
              onClick={() => onChange(moved(links, index, 1))}
            >
              ↓
            </button>
            <button
              type="button"
              aria-label="Удалить ссылку"
              onClick={() => onChange(links.filter((_, i) => i !== index))}
            >
              ×
            </button>
          </span>
        </div>
      ))}
      <button
        type="button"
        className="admin__ghost"
        onClick={() => onChange([...links, { label: '', href: '' }])}
      >
        + Ссылка
      </button>
    </div>
  )
}

function SaveBar({ store, label, onReset }) {
  return (
    <div className="admin-authors__actions">
      <button type="button" className="admin-field__link" disabled={store.busy} onClick={onReset}>
        Вернуть как было в коде
      </button>
      <button
        type="button"
        className="admin-field__save"
        disabled={store.busy || !store.dirty}
        onClick={() => void store.save()}
      >
        {store.busy ? 'Сохранение…' : label}
      </button>
    </div>
  )
}

/** «Меню и подвал»: верхняя строка шапки, полное меню, колонки подвала */
export default function AdminNavigation({ onMessage }) {
  const top = useStoredList('nav.top', () => codeTop.map((l) => ({ ...l })), {
    onMessage,
    okText: 'Верхняя строка сохранена',
    onSaved: (value) => applyTopNav(value || codeTop),
  })
  const menu = useStoredList(
    'nav.menu',
    () => codeMenu.map((s) => ({ ...s, links: [...s.links] })),
    {
      onMessage,
      okText: 'Меню сохранено',
      onSaved: (value) => applyMenu(value || codeMenu),
    },
  )
  const footer = useStoredList('nav.footer', () => JSON.parse(JSON.stringify(codeFooter)), {
    onMessage,
    okText: 'Подвал сохранён',
    onSaved: (value) => applyFooter(value || codeFooter),
  })

  if (!top.list || !menu.list || !footer.list)
    return <p className="admin__loading">Загрузка меню…</p>

  const updateSection = (index, patch) =>
    menu.change(menu.list.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  const updateColumn = (key, patch) =>
    footer.change({ ...footer.list, [key]: { ...footer.list[key], ...patch } })

  return (
    <div className="admin-product admin-nav">
      <PagesList />

      <section className="admin-field">
        <h3>Верхняя строка шапки</h3>
        <p className="admin-field__hint">Разделы под логотипом: «Каталог · Бренды · Интерьеры…»</p>
        <LinksEditor links={top.list} onChange={top.change} />
        <SaveBar store={top} label="Сохранить строку" onReset={() => void top.reset()} />
      </section>

      <section className="admin-field">
        <h3>Полное меню</h3>
        <p className="admin-field__hint">
          Колонки меню по кнопке «Меню». Список типов в колонке «Каталог» добавляется сам.
        </p>
        <div className="admin-nav__columns">
          {menu.list.map((section, index) => (
            <article key={index} className="admin-nav__column">
              <div className="admin-vacancy__row">
                <input
                  className="admin-author__name"
                  value={section.title}
                  placeholder="Заголовок колонки"
                  onChange={(e) => updateSection(index, { title: e.target.value })}
                />
                <span className="admin-pick__tools">
                  <button
                    type="button"
                    disabled={index === 0}
                    aria-label="Левее"
                    onClick={() => menu.change(moved(menu.list, index, -1))}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={index === menu.list.length - 1}
                    aria-label="Правее"
                    onClick={() => menu.change(moved(menu.list, index, 1))}
                  >
                    →
                  </button>
                  <button
                    type="button"
                    aria-label="Удалить колонку"
                    onClick={() => {
                      if (window.confirm(`Удалить колонку «${section.title}»?`)) {
                        menu.change(menu.list.filter((_, i) => i !== index))
                      }
                    }}
                  >
                    ×
                  </button>
                </span>
              </div>
              <input
                className="admin-nav__href"
                value={section.href}
                placeholder="Ссылка заголовка (необязательно)"
                list="admin-site-pages"
                onChange={(e) => updateSection(index, { href: e.target.value })}
              />
              <LinksEditor
                links={section.links}
                onChange={(links) => updateSection(index, { links })}
              />
            </article>
          ))}
        </div>
        <button
          type="button"
          className="admin__ghost"
          onClick={() => menu.change([...menu.list, { title: '', href: '', links: [] }])}
        >
          + Колонка
        </button>
        <SaveBar store={menu} label="Сохранить меню" onReset={() => void menu.reset()} />
      </section>

      <section className="admin-field">
        <h3>Подвал</h3>
        <p className="admin-field__hint">
          Колонка брендов собирается сама из вкладки «Бренды» — можно изменить только её заголовок.
        </p>
        <div className="admin-nav__columns">
          {['catalog', 'brands', 'company', 'services'].map((key) => (
            <article key={key} className="admin-nav__column">
              <input
                className="admin-author__name"
                value={footer.list[key]?.title || ''}
                placeholder="Заголовок колонки"
                onChange={(e) => updateColumn(key, { title: e.target.value })}
              />
              {key === 'brands' ? (
                <p className="admin-field__hint">{brands.map((b) => b.name).join(' · ')}</p>
              ) : (
                <LinksEditor
                  links={footer.list[key]?.links || []}
                  onChange={(links) => updateColumn(key, { links })}
                />
              )}
            </article>
          ))}
        </div>
        <SaveBar store={footer} label="Сохранить подвал" onReset={() => void footer.reset()} />
      </section>
    </div>
  )
}
