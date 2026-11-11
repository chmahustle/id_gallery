import { X } from 'lucide-react'
import { type FormEvent, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { buildWhatsAppLeadUrl } from '../../catalog/catalog'
import { Button } from '../../components/ui'
import { useContent } from '../../content/ContentContext'
import { getApprovedLegalLinks } from '../../data/legal'
import { todayISODate } from '../../data/request-page'
import {
  type RequestKind,
  REQUEST_RECIPIENTS,
  type RequestPayload,
  submitRequest,
} from '../../lib/requests'
import './RequestModal.css'

export type RequestContext = {
  kind: RequestKind
  /** Выбранный предмет, шоурум или тема */
  subject: string
}

type Status = 'idle' | 'sending' | 'success' | 'error'

const METHODS = ['Телефон', 'Email', 'WhatsApp'] as const

const COPY = {
  titles: {
    offer: 'Узнать стоимость',
    visit: 'Запросить посещение',
    project: 'Подбор и комплектация',
    specialist: 'Сотрудничество',
  } as Record<RequestKind, string>,
  name: 'Ваше имя',
  method: 'Как с вами связаться',
  contact: 'Контакт для ответа',
  comment: 'Комментарий по желанию',
  task: 'Тема и задача',
  role: 'Роль',
  company: 'Компания',
  date: 'Желаемая дата',
  time: 'Желаемое время',
  consent: 'Я согласен на обработку персональных данных',
  consentPolicy: 'Условия',
  consentRequired: 'Нужно согласие на обработку данных',
  contactLabels: {
    Телефон: 'Ваш телефон',
    Email: 'Ваш Email',
    WhatsApp: 'Ваш номер WhatsApp',
  } as Record<string, string>,
  submit: 'Отправить запрос',
  sending: 'Отправляем…',
  whatsapp: 'Или написать в WhatsApp',
  required: 'Заполните поле',
  close: 'Закрыть',
  successTitle: 'Заявка получена',
  successText:
    'Спасибо. Мы получили ваш запрос по выбранному предмету. Менеджер свяжется с вами указанным способом.',
  visitNote: 'Время встречи подтвердит менеджер.',
  back: 'Вернуться к просмотру',
  allProducts: 'Все товары',
  errorTitle: 'Заявка не отправлена',
  errorText:
    'Не удалось отправить запрос. Введённый текст сохранён. Повторите отправку или свяжитесь с нами напрямую.',
  retry: 'Повторить',
} as const

type FieldProps = {
  id: string
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: 'text' | 'date' | 'time'
  multiline?: boolean
  rows?: number
  min?: string
  autoComplete?: string
}

/** Поле с подписью внутри: подчёркивание вместо рамки, подпись поднимается при вводе */
function Field({
  id,
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  multiline = false,
  rows = 2,
  min,
  autoComplete,
}: FieldProps) {
  const errorId = error ? `${id}-err` : undefined
  const common = {
    id,
    name,
    value,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': errorId,
  }
  return (
    <div className={['rm-field', error ? 'is-error' : ''].filter(Boolean).join(' ')}>
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          {...common}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          {...common}
          type={type}
          min={min}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error ? (
        <p id={errorId} className="rm-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type RequestModalProps = {
  context: RequestContext
  onClose: () => void
  /** Для проверки экранов: начальное состояние */
  initialStatus?: Status
}

export function RequestModal({
  context,
  onClose,
  initialStatus = 'idle',
}: RequestModalProps) {
  const { content } = useContent()
  const baseId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const { kind, subject } = context

  const [status, setStatus] = useState<Status>(initialStatus)
  const [fields, setFields] = useState({
    name: '',
    method: METHODS[0] as string,
    contact: '',
    comment: '',
    task: '',
    role: '',
    company: '',
    date: '',
    time: '',
  })
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const privacy = getApprovedLegalLinks()[0]
  const whatsapp = content.contacts.whatsapp
  const phone = content.contacts.phone || ''
  const phoneDigits = phone.replace(/[^\d+]/g, '')
  const hasPhone = /\d{5,}/.test(phoneDigits)

  /* фокус в окно, Esc закрывает, страница под окном не прокручивается */
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      previous?.focus?.()
    }
  }, [onClose])

  function set<K extends keyof typeof fields>(key: K, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  function validate() {
    const next: Record<string, string> = {}
    if (!fields.name.trim()) next.name = COPY.required
    if (!fields.contact.trim()) next.contact = COPY.required
    if (kind === 'project' && !fields.task.trim()) next.task = COPY.required
    if (kind === 'specialist') {
      if (!fields.role.trim()) next.role = COPY.required
      if (!fields.company.trim()) next.company = COPY.required
    }
    if (kind === 'visit' && !fields.date && !fields.time) {
      next.date = COPY.required
    }
    if (!consent) next.consent = COPY.consentRequired
    return next
  }

  async function send() {
    /* во время отправки повторное нажатие исключено */
    if (status === 'sending') return
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return
    const payload: RequestPayload = {
      kind,
      subject,
      name: fields.name.trim(),
      contactMethod: fields.method,
      contact: fields.contact.trim(),
      comment: (kind === 'project' ? fields.task : fields.comment).trim(),
      page: window.location.pathname + window.location.search,
      recipient: REQUEST_RECIPIENTS[kind],
      ...(kind === 'visit' ? { date: fields.date, time: fields.time } : {}),
      ...(kind === 'specialist'
        ? { role: fields.role.trim(), company: fields.company.trim() }
        : {}),
    }
    setStatus('sending')
    try {
      await submitRequest(payload)
      setStatus('success')
    } catch {
      /* введённый текст остаётся в форме; ложного подтверждения нет */
      setStatus('error')
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void send()
  }

  const whatsappHref = buildWhatsAppLeadUrl(
    whatsapp,
    `Здравствуйте! ${COPY.titles[kind]}${subject ? `: ${subject}` : ''}.`,
  )
  const hasWhatsApp = whatsappHref && whatsappHref !== '#'

  const title = COPY.titles[kind]
  const titleId = `${baseId}-title`
  const editing = status === 'idle' || status === 'sending' || status === 'error'

  return (
    <div
      className="request-modal"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className="request-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <button
          type="button"
          className="request-modal__close"
          aria-label={COPY.close}
          onClick={onClose}
        >
          <X size={24} strokeWidth={1} aria-hidden="true" />
        </button>

        {status === 'success' ? (
          <div className="request-modal__result" role="status">
            <h2 id={titleId} className="request-modal__title">
              {COPY.successTitle}
            </h2>
            <p className="request-modal__text">{COPY.successText}</p>
            {kind === 'visit' ? (
              <p className="request-modal__note">{COPY.visitNote}</p>
            ) : null}
            <div className="request-modal__actions">
              <Button type="button" variant="primary" onClick={onClose}>
                {COPY.back}
              </Button>
              <Link className="request-modal__link" to="/catalog" onClick={onClose}>
                {COPY.allProducts}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h2 id={titleId} className="request-modal__title">
              {status === 'error' ? COPY.errorTitle : title}
            </h2>
            {status === 'error' ? (
              <div role="alert">
                <p className="request-modal__text">{COPY.errorText}</p>
                <div className="request-modal__actions">
                  <Button type="button" variant="primary" onClick={() => void send()}>
                    {COPY.retry}
                  </Button>
                  {hasWhatsApp ? (
                    <a
                      className="request-modal__link"
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                  {hasPhone ? (
                    <a className="request-modal__link" href={`tel:${phoneDigits}`}>
                      {phone}
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            {editing ? (
              <form className="request-modal__form" onSubmit={onSubmit} noValidate>
                {subject ? (
                  <p className="request-modal__subject">{subject}</p>
                ) : null}

                <p className="rm-method__title" id={`${baseId}-method`}>
                  {COPY.method}
                </p>
                <div
                  className="rm-method"
                  role="radiogroup"
                  aria-labelledby={`${baseId}-method`}
                >
                  {METHODS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      role="radio"
                      aria-checked={fields.method === method}
                      className={fields.method === method ? 'is-active' : undefined}
                      onClick={() => set('method', method)}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                <div className="request-modal__row">
                  <Field
                    id={`${baseId}-name`}
                    label={COPY.name}
                    name="name"
                    autoComplete="name"
                    value={fields.name}
                    error={errors.name}
                    onChange={(v) => set('name', v)}
                  />
                  <Field
                    id={`${baseId}-contact`}
                    label={COPY.contactLabels[fields.method] ?? COPY.contact}
                    name="contact"
                    autoComplete={fields.method === 'Email' ? 'email' : 'tel'}
                    value={fields.contact}
                    error={errors.contact}
                    onChange={(v) => set('contact', v)}
                  />
                </div>

                {kind === 'project' ? (
                  <Field
                    id={`${baseId}-task`}
                    label={COPY.task}
                    name="task"
                    multiline
                    rows={2}
                    value={fields.task}
                    error={errors.task}
                    onChange={(v) => set('task', v)}
                  />
                ) : null}

                {kind === 'specialist' ? (
                  <div className="request-modal__row">
                    <Field
                      id={`${baseId}-role`}
                      label={COPY.role}
                      name="role"
                      value={fields.role}
                      error={errors.role}
                      onChange={(v) => set('role', v)}
                    />
                    <Field
                      id={`${baseId}-company`}
                      label={COPY.company}
                      name="company"
                      value={fields.company}
                      error={errors.company}
                      onChange={(v) => set('company', v)}
                    />
                  </div>
                ) : null}

                {kind === 'visit' ? (
                  <div className="request-modal__row">
                    <Field
                      id={`${baseId}-date`}
                      label={COPY.date}
                      name="date"
                      type="date"
                      min={todayISODate()}
                      value={fields.date}
                      error={errors.date}
                      onChange={(v) => set('date', v)}
                    />
                    <Field
                      id={`${baseId}-time`}
                      label={COPY.time}
                      name="time"
                      type="time"
                      value={fields.time}
                      onChange={(v) => set('time', v)}
                    />
                  </div>
                ) : null}

                {kind !== 'project' ? (
                  <Field
                    id={`${baseId}-comment`}
                    label={COPY.comment}
                    name="comment"
                    multiline
                    rows={2}
                    value={fields.comment}
                    onChange={(v) => set('comment', v)}
                  />
                ) : null}

                <div className="request-modal__consent">
                  <label className="request-modal__check">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      aria-invalid={errors.consent ? true : undefined}
                    />
                    <span>
                      {COPY.consent}
                      {privacy && privacy.status === 'approved' ? (
                        <>
                          {' · '}
                          <Link to={privacy.href} target="_blank">
                            {COPY.consentPolicy}
                          </Link>
                        </>
                      ) : null}
                    </span>
                  </label>
                  {errors.consent ? (
                    <p className="rm-field__error" role="alert">
                      {errors.consent}
                    </p>
                  ) : null}
                </div>

                <div className="request-modal__actions">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? COPY.sending : COPY.submit}
                  </Button>
                  {hasWhatsApp ? (
                    <a
                      className="request-modal__link"
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {COPY.whatsapp}
                    </a>
                  ) : null}
                </div>
              </form>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
