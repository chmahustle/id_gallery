import type { EditableField } from '../content/editable'

/* поля конструктора «Тексты и фото»: кнопка со ссылкой, превью для поисковиков */

/** Кнопка: текст и ссылка (значение — JSON {label, href}) */
type LinkValue = { label: string; href: string }

export function LinkInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  let data: LinkValue = { label: '', href: '' }
  try {
    data = { ...data, ...JSON.parse(value) }
  } catch {
    /* пустое значение */
  }
  const set = (patch: Partial<LinkValue>) => onChange(JSON.stringify({ ...data, ...patch }))
  return (
    <div className="admin-link-field">
      <label>
        <span>Текст кнопки</span>
        <input value={data.label} onChange={(e) => set({ label: e.target.value })} />
      </label>
      <label>
        <span>Куда ведёт</span>
        <input
          value={data.href}
          list="admin-site-pages"
          placeholder="/страница или https://…"
          onChange={(e) => set({ href: e.target.value })}
        />
      </label>
    </div>
  )
}

/** Как страница выглядит в поиске: заголовок, адрес, описание */
export function SeoPreview({
  fields,
  drafts,
  path,
}: {
  fields: EditableField[]
  drafts: Record<string, string>
  path: string
}) {
  const valueOf = (suffix: string) => {
    const field = fields.find((f) => f.id.endsWith(suffix))
    if (!field) return ''
    return drafts[field.id] ?? field.get()
  }
  const title = valueOf('.title') || 'Заголовок страницы — ID Gallery'
  const description =
    valueOf('.description') ||
    'Описание страницы для поисковиков: 1–2 предложения о том, что здесь есть.'
  return (
    <div className="admin-seo">
      <span className="admin-field__role">Так страница выглядит в поиске</span>
      <div className="admin-seo__card">
        <span className="admin-seo__url">{`idgallery.kz${path === '/' ? '' : path}`}</span>
        <span className="admin-seo__title">{title}</span>
        <span className="admin-seo__text">{description}</span>
      </div>
      <p className="admin-field__hint">
        {`Заголовок — до 60 знаков, описание — до 160. Сейчас: ${title.length} и ${description.length}.`}
      </p>
    </div>
  )
}
