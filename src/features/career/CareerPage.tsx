import { ArrowDown, Minus, Plus } from 'lucide-react'
import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { Button } from '../../components/ui'
import {
  careerCopy as copy,
  careerFormImage,
  careerHero,
  careerWhy,
  vacancies,
} from '../../data/career'
import './CareerPage.css'

type Fields = { name: string; contact: string; about: string; link: string }
type Errors = Partial<Record<keyof Fields, string>>

/** Заглушка: приёма откликов на сервере пока нет; ложного «Отправлено» не показываем */
function submitStub(_payload: Fields & { vacancy: string }): void {
  void _payload
}

/** /career/ — вакансии (если есть) и общий отклик «Расскажите о себе» */
export function CareerPage() {
  const baseId = useId()
  const formRef = useRef<HTMLElement>(null)
  const [openSlug, setOpenSlug] = useState('')
  const [vacancy, setVacancy] = useState('')
  const [fields, setFields] = useState<Fields>({ name: '', contact: '', about: '', link: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [heroReady, setHeroReady] = useState(false)

  /* появление текста на кадре, как у страниц «Профессионалам» и «О галерее» */
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setHeroReady(true))
    return () => window.cancelAnimationFrame(id)
  }, [])

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((current) => ({ ...current, [key]: value }))
  }

  function apply(title: string) {
    setVacancy(title)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Errors = {}
    if (!fields.name.trim()) next.name = copy.errorRequired
    if (!fields.contact.trim()) next.contact = copy.errorRequired
    if (!fields.about.trim()) next.about = copy.errorRequired
    setErrors(next)
    if (Object.keys(next).length) return
    submitStub({ ...fields, vacancy })
  }

  const field = (key: keyof Fields, label: string, multiline = false) => {
    const id = `${baseId}-${key}`
    const error = errors[key]
    const common = {
      id,
      name: key,
      value: fields[key],
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `${id}-err` : undefined,
      className: ['career-form__control', error ? 'is-error' : ''].filter(Boolean).join(' '),
    }
    return (
      <div className="career-form__field">
        <label htmlFor={id}>{label}</label>
        {multiline ? (
          <textarea {...common} rows={5} onChange={(e) => set(key, e.target.value)} />
        ) : (
          <input
            {...common}
            type="text"
            autoComplete={key === 'name' ? 'name' : key === 'contact' ? 'email' : 'url'}
            onChange={(e) => set(key, e.target.value)}
          />
        )}
        {error ? (
          <p id={`${id}-err`} className="career-form__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <article className="career-page">
      <section
        className={['career-hero', heroReady ? 'is-ready' : ''].join(' ')}
        aria-labelledby="career-title"
      >
        <img
          className="career-hero__img"
          src={careerHero.image}
          alt=""
          loading="eager"
          fetchPriority="high"
          decoding="async"
          style={{ objectPosition: careerHero.objectPosition }}
        />
        <div className="career-hero__scrim" aria-hidden="true" />
        <div className="career-hero__content">
          <h1 id="career-title" className="career-hero__title">
            {copy.title}
          </h1>
          <p className="career-hero__lead">{copy.lead}</p>
          <a className="career-hero__link" href="#career-vacancies">
            {copy.heroLink}
            <ArrowDown size={16} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="career-page__section" aria-labelledby="career-why">
        <h2 id="career-why" className="career-page__h2">
          {copy.whyTitle}
        </h2>
        <ul className="career-why">
          {careerWhy.map((item) => (
            <li key={item.title}>
              <span className="career-why__media">
                <img src={item.image} alt="" loading="lazy" />
              </span>
              <h3 className="career-why__title">{item.title}</h3>
              <p className="career-why__text">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="career-vacancies"
        className="career-page__section career-page__anchor"
        aria-labelledby="career-vacancies-title"
      >
        <h2 id="career-vacancies-title" className="career-page__h2">
          {copy.vacanciesTitle}
        </h2>
        {vacancies.length ? (
          <ul className="career-vacancies">
            {vacancies.map((item) => {
              const open = openSlug === item.slug
              const panelId = `${baseId}-${item.slug}`
              return (
                <li key={item.slug} className={open ? 'is-open' : undefined}>
                  <button
                    type="button"
                    className="career-vacancies__head"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenSlug(open ? '' : item.slug)}
                  >
                    <span className="career-vacancies__title">{item.title}</span>
                    {item.place ? (
                      <span className="career-vacancies__place">{item.place}</span>
                    ) : null}
                    {open ? (
                      <Minus size={20} strokeWidth={1} aria-hidden="true" />
                    ) : (
                      <Plus size={20} strokeWidth={1} aria-hidden="true" />
                    )}
                  </button>
                  <div id={panelId} className="career-vacancies__drawer" inert={!open || undefined}>
                    <div className="career-vacancies__inner">
                      {item.text.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                      <button
                        type="button"
                        className="career-vacancies__apply"
                        onClick={() => apply(item.title)}
                      >
                        {copy.apply}
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="career-page__empty">{copy.noVacancies}</p>
        )}
      </section>

      <section
        ref={formRef}
        className="career-page__section career-form"
        aria-labelledby="career-form-title"
      >
        <div className="career-form__grid">
          <div className="career-form__media">
            <img
              src={careerFormImage.image}
              alt=""
              loading="lazy"
              style={{ objectPosition: careerFormImage.objectPosition }}
            />
          </div>
          <div className="career-form__panel">
            <h2 id="career-form-title" className="career-page__h2">
              {copy.formTitle}
            </h2>
            <p className="career-page__lead">{copy.formLead}</p>
            {vacancy ? (
              <p className="career-form__topic">
                {`${copy.vacancyTopic}: ${vacancy}`}
                <button type="button" onClick={() => setVacancy('')} aria-label="Убрать вакансию">
                  ×
                </button>
              </p>
            ) : null}
            <form className="career-form__form" onSubmit={onSubmit} noValidate>
              <div className="career-form__pair">
                {field('name', copy.fieldName)}
                {field('contact', copy.fieldContact)}
              </div>
              {field('about', copy.fieldAbout, true)}
              {field('link', copy.fieldLink)}
              <div>
                <Button type="submit" variant="primary" fullWidthMobile>
                  {copy.submit}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </article>
  )
}
