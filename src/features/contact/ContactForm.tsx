import { type FormEvent, useId, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui'
import {
  contactPageCopy,
  type ContactTopic,
} from '../../data/contact-page'
import { ContactField } from './ContactField'

type FormFields = {
  name: string
  contact: string
  message: string
}

type FormErrors = Partial<Record<keyof FormFields, string>>

const TOPIC_KEYS = new Set<string>(['visit', 'materials', 'trade'])

function topicHint(raw: string | null): string {
  if (!raw || !TOPIC_KEYS.has(raw)) return ''
  return contactPageCopy.topicHints[raw as ContactTopic]
}

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {}
  if (!fields.name.trim()) errors.name = contactPageCopy.errorRequired
  if (!fields.contact.trim()) errors.contact = contactPageCopy.errorRequired
  if (!fields.message.trim()) errors.message = contactPageCopy.errorRequired
  return errors
}

/** Заглушка: без fetch и без «Спасибо» / «Отправлено» */
function submitStub(_fields: FormFields): void {
  void _fields
}

export function ContactForm() {
  const baseId = useId()
  const [params] = useSearchParams()
  const hint = topicHint(params.get('topic'))

  const [fields, setFields] = useState<FormFields>({
    name: '',
    contact: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validate(fields)
    setErrors(next)
    if (Object.keys(next).length > 0) return
    submitStub(fields)
  }

  return (
    <section
      className="contact-page__form-block"
      aria-labelledby="contact-form-title"
    >
      <div className="contact-page__label-wrap">
        <span className="contact-page__label-rule" aria-hidden="true" />
        <h2 id="contact-form-title" className="contact-page__label">
          {contactPageCopy.formTitle}
        </h2>
      </div>

      <div className="contact-page__form-panel">
        <p className="contact-page__form-lead">{contactPageCopy.formLead}</p>

        <form className="contact-page__form" onSubmit={onSubmit} noValidate>
          <ContactField
            id={`${baseId}-name`}
            label={contactPageCopy.fieldName}
            name="name"
            autoComplete="name"
            value={fields.name}
            error={errors.name}
            onChange={(name) => setFields((prev) => ({ ...prev, name }))}
          />
          <ContactField
            id={`${baseId}-contact`}
            label={contactPageCopy.fieldContact}
            name="contact"
            autoComplete="email"
            value={fields.contact}
            error={errors.contact}
            onChange={(contact) => setFields((prev) => ({ ...prev, contact }))}
          />
          <ContactField
            id={`${baseId}-message`}
            label={contactPageCopy.fieldMessage}
            name="message"
            multiline
            rows={4}
            placeholder={hint || undefined}
            value={fields.message}
            error={errors.message}
            onChange={(message) => setFields((prev) => ({ ...prev, message }))}
          />
          <div className="contact-page__form-actions">
            <Button type="submit" variant="primary">
              {contactPageCopy.submit}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
