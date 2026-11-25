import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import { editableFields } from '../content/editable'
import { getPageConfigs } from '../content/pageBlocks'
import AdminBrandStripPicker from './AdminBrandStripPicker'
import AdminBrandPagePicker from './AdminBrandPagePicker'
import { getBrandRecord, loadBrandRecords, saveBrandField } from './adminBrandStore'
import { ContactsEditor, ShowroomsEditor } from './AdminContacts'
import AdminFeaturedPicker from './AdminFeaturedPicker'
import { PagesList } from './adminPages'
import AdminVacancies from './AdminVacancies'
import { explainError, uploadAdminFile } from './adminUpload'
import { FrameButton } from './AdminFrame'
import { measuredFrames, measuredStart } from './adminFrames'
import './AdminEditor.css'
import { LinkInput, SeoPreview } from './AdminContentFields'
import { fieldRole } from './adminFieldRole'
import { PageCanvas } from './AdminPageCanvas'

/**
 * «Тексты и фото» — конструктор: слева страницы, в центре страница по блокам
 * (подписи, перетаскивание), справа настройки выбранного блока.
 */
export default function AdminContent({ onMessage }) {
  const [page, setPage] = useState(() => getPageConfigs()[0])
  const [saved, setSaved] = useState({})
  const [drafts, setDrafts] = useState({})
  const [busy, setBusy] = useState('')
  const [ready, setReady] = useState(false)
  const [version, setVersion] = useState(0)
  const [blocks, setBlocks] = useState([])
  const [selectedBlock, setSelectedBlock] = useState('')
  const [selectedField, setSelectedField] = useState('')
  const [pagesOpen, setPagesOpen] = useState(true)
  const fieldRefs = useRef({})

  /* Esc закрывает окно настроек */
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setSelectedBlock('')
        setSelectedField('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* записи брендов: поля брендов и выбор товаров на их страницах */
  const [brandRev, setBrandRev] = useState(0)
  useEffect(() => {
    loadBrandRecords()
      .then(() => setBrandRev((n) => n + 1))
      .catch((err) => onMessage({ error: explainError(err, 'Не удалось загрузить бренды') }))
  }, [onMessage])

  /* список страниц: бренды из админки появляются после загрузки записей */
  // eslint-disable-next-line react-hooks/exhaustive-deps -- пересобрать после загрузки брендов
  const pageConfigs = useMemo(() => getPageConfigs(), [brandRev])

  /* значение, сохранённое в админке (правка текста или поле бренда) */
  const savedOf = (field) =>
    field.brand ? getBrandRecord(field.brand.slug)?.data?.[field.brand.key] : saved[field.id]

  useEffect(() => {
    api('/api/content')
      .then((data) => {
        const values = data.values || {}
        setSaved(values)
        for (const config of getPageConfigs()) {
          if (config.orderKey && values[config.orderKey]) {
            try {
              config.setOrder(JSON.parse(values[config.orderKey]))
            } catch {
              /* порядок из кода */
            }
          }
        }
      })
      .catch((err) => onMessage({ error: explainError(err, 'Ошибка сервера') }))
      .finally(() => setReady(true))
  }, [onMessage])

  const refresh = () => setVersion((v) => v + 1)
  const pageFields = editableFields.filter((field) => field.group === page.group)
  /* страница без копии: блоки — группы полей по их блоку */
  const formBlocks = page.formOnly
    ? page.formOnly.map((section) => ({
        id: section.id,
        label: section.label,
        fields: pageFields.filter((field) => field.block === section.id).map((field) => field.id),
      }))
    : null
  /* «Кнопки и подписи» и «Для поисковиков» — списки полей страницы вне копии */
  const pseudoBlocks = [
    {
      id: '__extra',
      label: 'Кнопки и подписи',
      fields: pageFields.filter((field) => field.extra).map((field) => field.id),
    },
    {
      id: '__seo',
      label: 'Для поисковиков',
      fields: pageFields.filter((field) => field.seo).map((field) => field.id),
    },
  ]
  const block = [...(formBlocks || blocks), ...pseudoBlocks].find((b) => b.id === selectedBlock)
  const shownFields = block ? pageFields.filter((field) => block.fields.includes(field.id)) : []

  function selectField(id) {
    setSelectedField(id)
    window.setTimeout(() => {
      fieldRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 60)
  }

  async function save(field, value) {
    setBusy(field.id)
    try {
      if (field.brand) {
        /* поле бренда — в карточку бренда */
        await saveBrandField(field.brand.slug, field.brand.key, value)
        setBrandRev((n) => n + 1)
      } else {
        await api(`/api/content/${encodeURIComponent(field.id)}`, {
          method: 'PUT',
          body: JSON.stringify({ value }),
        })
        setSaved((prev) => ({ ...prev, [field.id]: value }))
      }
      field.apply(value)
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[field.id]
        return next
      })
      refresh()
      onMessage({ ok: `Сохранено: ${field.label}` })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сохранить') })
    } finally {
      setBusy('')
    }
  }

  async function reset(field) {
    setBusy(field.id)
    try {
      if (field.brand) {
        await saveBrandField(field.brand.slug, field.brand.key, undefined)
        setBrandRev((n) => n + 1)
      } else {
        await api(`/api/content/${encodeURIComponent(field.id)}`, { method: 'DELETE' })
      }
      field.apply(field.defaultValue)
      setSaved((prev) => {
        const next = { ...prev }
        delete next[field.id]
        return next
      })
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[field.id]
        return next
      })
      refresh()
      onMessage({ ok: `Возвращено исходное: ${field.label}` })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сбросить') })
    } finally {
      setBusy('')
    }
  }

  async function upload(field, file) {
    setBusy(field.id)
    try {
      const url = await uploadAdminFile(file)
      setBusy('')
      await save(field, url)
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось загрузить фото') })
      setBusy('')
    }
  }

  /* порядок меняется сразу; если сохранить не удалось — возвращается прежний */
  async function saveOrder(list) {
    const previous = [...page.getOrder()]
    page.setOrder(list)
    refresh()
    try {
      await api(`/api/content/${encodeURIComponent(page.orderKey)}`, {
        method: 'PUT',
        body: JSON.stringify({ value: JSON.stringify(list) }),
      })
      setSaved((prev) => ({ ...prev, [page.orderKey]: JSON.stringify(list) }))
      onMessage({ ok: 'Порядок блоков сохранён' })
    } catch (err) {
      page.setOrder(previous)
      refresh()
      onMessage({ error: `Порядок не сохранён. ${explainError(err, 'Ошибка сервера')}` })
    }
  }

  async function resetOrder() {
    try {
      await api(`/api/content/${encodeURIComponent(page.orderKey)}`, { method: 'DELETE' })
      page.setOrder([...page.defaultOrder])
      setSaved((prev) => {
        const next = { ...prev }
        delete next[page.orderKey]
        return next
      })
      refresh()
      onMessage({ ok: 'Возвращён исходный порядок блоков' })
    } catch (err) {
      onMessage({ error: explainError(err, 'Не удалось сбросить порядок') })
    }
  }

  const onBlocks = useCallback((list) => setBlocks(list), [])

  if (!ready) return <p className="admin__loading">Загрузка…</p>

  return (
    <>
      <PagesList />
      <div
        className={['admin-visual', pagesOpen ? 'is-pages-open' : '', block ? 'is-panel-open' : '']
          .filter(Boolean)
          .join(' ')}
      >
        {/* —— Страницы: сворачиваются в узкую полоску —— */}
        <div className="admin-visual__pane admin-visual__pane--left">
          <button
            type="button"
            className="admin-visual__rail"
            aria-expanded={pagesOpen}
            aria-label={pagesOpen ? 'Свернуть список страниц' : 'Показать список страниц'}
            onClick={() => setPagesOpen((open) => !open)}
          >
            <span aria-hidden="true">{pagesOpen ? '‹' : '›'}</span>
            {!pagesOpen ? <span className="admin-visual__rail-text">Страницы</span> : null}
          </button>
          <nav
            className="admin-visual__pages"
            aria-label="Страницы сайта"
            inert={!pagesOpen || undefined}
          >
            {pageConfigs.map((item) => {
              const changed = editableFields.filter(
                (field) => field.group === item.group && savedOf(field),
              ).length
              return (
                <button
                  key={item.path}
                  type="button"
                  className={item.path === page.path ? 'is-active' : undefined}
                  aria-pressed={item.path === page.path}
                  onClick={() => {
                    setPage(item)
                    setSelectedBlock('')
                    setSelectedField('')
                    setBlocks([])
                  }}
                >
                  {item.label}
                  {changed ? <em>{changed}</em> : null}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="admin-visual__preview">
          <div className="admin-visual__bar">
            <div className="admin-visual__device admin-visual__extra">
              {pseudoBlocks.map((item) =>
                item.fields.length ? (
                  <button
                    key={item.id}
                    type="button"
                    className={selectedBlock === item.id ? 'is-active' : undefined}
                    onClick={() => {
                      setSelectedBlock(selectedBlock === item.id ? '' : item.id)
                      setSelectedField('')
                    }}
                  >
                    {`${item.label} · ${item.fields.length}`}
                  </button>
                ) : null,
              )}
            </div>
            <div className="admin-visual__device">
              {page.orderKey && saved[page.orderKey] ? (
                <button type="button" onClick={() => void resetOrder()}>
                  Исходный порядок
                </button>
              ) : null}
              <a href={page.path} target="_blank" rel="noopener noreferrer">
                Открыть страницу ↗
              </a>
            </div>
          </div>
          <div className="admin-visual__stage">
            {formBlocks ? (
              /* схема страницы: блоки с текущими текстами, нажатие — настройки справа */
              <div className="admin-outline">
                {formBlocks.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      'admin-outline__block',
                      selectedBlock === item.id ? 'is-selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => {
                      setSelectedBlock(item.id)
                      setSelectedField('')
                    }}
                  >
                    <span className="admin-outline__label">{item.label}</span>
                    <span className="admin-outline__values">
                      {item.fields.slice(0, 12).map((id) => {
                        const field = pageFields.find((f) => f.id === id)
                        return field && field.kind !== 'image' ? (
                          <span key={id} className={`is-${fieldRole(field).role}`}>
                            {field.get()}
                          </span>
                        ) : null
                      })}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <PageCanvas
                key={page.path}
                config={page}
                version={`${version}-${brandRev}`}
                selectedBlock={selectedBlock}
                onSelectBlock={(id) => {
                  setSelectedBlock(id)
                  setSelectedField('')
                }}
                onSelectField={selectField}
                onBlocks={onBlocks}
                onReorder={(list) => void saveOrder(list)}
              />
            )}
          </div>
        </div>

        {/* —— Окно настроек выбранного блока: выезжает справа —— */}
        <aside
          className="admin-visual__pane admin-visual__pane--right"
          aria-label="Настройки блока"
          inert={!block || undefined}
        >
          <div className="admin-sheet">
            <header className="admin-sheet__head">
              <div>
                <span className="admin-sheet__kicker">{page.label}</span>
                <h2>{block?.label || ''}</h2>
              </div>
              <button
                type="button"
                className="admin-sheet__close"
                aria-label="Закрыть настройки"
                onClick={() => {
                  setSelectedBlock('')
                  setSelectedField('')
                }}
              >
                ×
              </button>
            </header>
            <div className="admin-sheet__body">
              {/* «По комнатам» на главной: товары по ссылкам */}
              {page.path === '/' && block?.id === 'featured' ? (
                <AdminFeaturedPicker onMessage={onMessage} onChanged={refresh} />
              ) : null}

              {/* страница бренда: товары, интерьеры и каталоги этого бренда */}
              {page.brandSlug &&
              ['featured', 'interiors', 'catalogs', 'authors'].includes(block?.id) ? (
                <AdminBrandPagePicker
                  key={`${page.brandSlug}-${block.id}`}
                  brandSlug={page.brandSlug}
                  kind={block.id}
                  onMessage={onMessage}
                  onChanged={refresh}
                />
              ) : null}

              {/* контакты и шоурумы — те же редакторы, что во вкладке «Контакты и шоурумы» */}
              {block?.id === 'contacts' ? (
                <ContactsEditor onMessage={onMessage} onChanged={refresh} />
              ) : null}
              {block?.id === 'showrooms' ? (
                <ShowroomsEditor onMessage={onMessage} onChanged={refresh} />
              ) : null}
              {block?.id === 'vacancies' ? (
                <AdminVacancies onMessage={onMessage} onChanged={refresh} />
              ) : null}

              {/* «Бренды» на главной: какие бренды в полосе под баннером */}
              {page.path === '/' && block?.id === 'brands' ? (
                <AdminBrandStripPicker onMessage={onMessage} onChanged={refresh} />
              ) : null}

              {block &&
              shownFields.length === 0 &&
              !['contacts', 'showrooms', 'vacancies'].includes(block.id) &&
              !(page.path === '/' && ['featured', 'brands'].includes(block.id)) &&
              !(
                page.brandSlug &&
                ['featured', 'interiors', 'catalogs', 'authors'].includes(block.id)
              ) ? (
                <p className="admin-field__hint">
                  В этом блоке нет полей для правки из админки (например, товары меняются во вкладке
                  «Товары»).
                </p>
              ) : null}

              {block?.id === '__seo' ? (
                <SeoPreview fields={shownFields} drafts={drafts} path={page.path} />
              ) : null}

              {shownFields.map((field) => {
                const current = savedOf(field) ?? field.defaultValue
                const value = drafts[field.id] ?? current
                const dirty = drafts[field.id] !== undefined && drafts[field.id] !== current
                const isBusy = busy === field.id
                const { role, name, place } = fieldRole(field)
                return (
                  <section
                    key={field.id}
                    ref={(el) => {
                      fieldRefs.current[field.id] = el
                    }}
                    className={[
                      'admin-field',
                      'admin-field--compact',
                      `admin-field--${role}`,
                      selectedField === field.id ? 'is-selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <header className="admin-field__head">
                      <span className="admin-field__role">{name}</span>
                      {place ? <span className="admin-field__place">{place}</span> : null}
                      {savedOf(field) ? (
                        <span className="admin-field__dot" title="Изменено в админке" />
                      ) : null}
                    </header>

                    {role === 'image' ? (
                      /* фото — само кнопка: нажатие открывает выбор файла */
                      <>
                        <label
                          className={['admin-photo', isBusy ? 'is-busy' : '']
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <img src={value} alt="" />
                          <span className="admin-photo__over">
                            {isBusy ? 'Загрузка…' : 'Заменить фото'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isBusy}
                            onChange={(event) => {
                              const file = event.target.files?.[0]
                              if (file) void upload(field, file)
                              event.target.value = ''
                            }}
                          />
                        </label>
                        <FrameButton
                          src={value}
                          disabled={isBusy}
                          aspects={() => measuredFrames(field.id)}
                          start={() => measuredStart(field.id)}
                          onChange={(next) => setDrafts((prev) => ({ ...prev, [field.id]: next }))}
                        />
                      </>
                    ) : role === 'link' ? (
                      /* кнопка: текст и ссылка меняются вместе */
                      <LinkInput
                        value={value}
                        onChange={(next) => setDrafts((prev) => ({ ...prev, [field.id]: next }))}
                      />
                    ) : (
                      <textarea
                        className="admin-field__input"
                        rows={Math.min(
                          8,
                          Math.max(
                            1,
                            Math.ceil(String(value).length / (role === 'title' ? 28 : 46)),
                          ),
                        )}
                        value={value}
                        onChange={(event) =>
                          setDrafts((prev) => ({ ...prev, [field.id]: event.target.value }))
                        }
                        onKeyDown={(event) => {
                          /* Ctrl/Cmd + Enter — сохранить */
                          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && dirty) {
                            void save(field, String(value).trim())
                          }
                        }}
                      />
                    )}

                    {dirty || savedOf(field) ? (
                      <div className="admin-field__actions">
                        {dirty ? (
                          <button
                            type="button"
                            className="admin-field__save"
                            disabled={isBusy || !String(value).trim()}
                            onClick={() => void save(field, String(value).trim())}
                          >
                            {isBusy ? 'Сохранение…' : 'Сохранить'}
                          </button>
                        ) : null}
                        {savedOf(field) && !dirty ? (
                          <button
                            type="button"
                            className="admin-field__link"
                            disabled={isBusy}
                            onClick={() => void reset(field)}
                          >
                            Вернуть исходное
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </section>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
