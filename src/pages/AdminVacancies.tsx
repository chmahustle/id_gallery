import { vacancies, applyVacancies } from '../data/career'
import { type AdminMessage, moved, useStoredList } from './adminListStore'
import { AdminIconButton } from './AdminIconButton'

/** Вакансия в редакторе: текст одной строкой, абзацы — через пустую строку */
type VacancyItem = { slug: string; title: string; place: string; text: string; published: boolean }

/** Вакансии из кода (демо) — с них редактор начинает в первый раз */
const codeVacancies: VacancyItem[] = vacancies.map((item) => ({
  slug: item.slug,
  title: item.title,
  place: item.place || '',
  text: item.text.join('\n\n'),
  published: true,
}))

/**
 * Вакансии страницы «Карьера»: название, город, текст (абзацы — через
 * пустую строку). Нет ни одной показанной — на сайте «Сейчас открытых вакансий нет».
 */
export default function AdminVacancies({
  onMessage,
  onChanged = () => {},
}: {
  onMessage: (message: AdminMessage) => void
  onChanged?: () => void
}) {
  const { list, change, dirty, busy, save } = useStoredList<VacancyItem[]>(
    'career.vacancies',
    () => codeVacancies.map((item) => ({ ...item })),
    {
      onMessage,
      okText: 'Вакансии сохранены',
      onSaved: (value) => {
        applyVacancies(value || [])
        onChanged()
      },
    },
  )

  if (!list) return <p className="admin__loading">Загрузка вакансий…</p>

  const items = list
  const update = (index: number, patch: Partial<VacancyItem>) =>
    change(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))

  return (
    <section className="admin-field admin-pick">
      <h3>Вакансии</h3>
      <p className="admin-field__hint">
        Абзацы текста разделяйте пустой строкой. Если вакансий нет — на сайте «Сейчас открытых
        вакансий нет».
      </p>
      {items.map((item, index) => (
        <article key={item.slug} className="admin-vacancy">
          <div className="admin-vacancy__row">
            <input
              className="admin-author__name"
              placeholder="Название вакансии"
              value={item.title}
              onChange={(e) => update(index, { title: e.target.value })}
            />
            <span className="admin-pick__tools">
              <button
                type="button"
                disabled={busy || index === 0}
                aria-label="Выше"
                onClick={() => change(moved(items, index, -1))}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={busy || index === items.length - 1}
                aria-label="Ниже"
                onClick={() => change(moved(items, index, 1))}
              >
                ↓
              </button>
              <AdminIconButton
                icon="delete"
                size="sm"
                disabled={busy}
                label="Удалить вакансию"
                onClick={() => change(items.filter((_, i) => i !== index))}
              />
            </span>
          </div>
          <input
            placeholder="Город или формат, например «Алматы» или «Удалённо»"
            value={item.place}
            onChange={(e) => update(index, { place: e.target.value })}
          />
          <textarea
            rows={4}
            placeholder={'Задачи и обязанности.\n\nТребования и условия.'}
            value={item.text}
            onChange={(e) => update(index, { text: e.target.value })}
          />
          <label className="admin-check">
            <input
              type="checkbox"
              checked={item.published !== false}
              onChange={(e) => update(index, { published: e.target.checked })}
            />
            Показывать на сайте
          </label>
        </article>
      ))}
      {items.length === 0 ? <p className="admin-pick__empty">Вакансий нет</p> : null}
      <div className="admin-authors__actions">
        <button
          type="button"
          className="admin__ghost"
          onClick={() =>
            change([
              ...items,
              {
                slug: `vacancy-${Date.now().toString(36)}`,
                title: '',
                place: '',
                text: '',
                published: true,
              },
            ])
          }
        >
          + Вакансия
        </button>
        <button
          type="button"
          className="admin-field__save"
          disabled={busy || !dirty}
          onClick={() => void save()}
        >
          {busy ? 'Сохранение…' : 'Сохранить вакансии'}
        </button>
      </div>
    </section>
  )
}
