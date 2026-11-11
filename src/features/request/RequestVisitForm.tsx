import { type FormEvent, useId, useState } from 'react'
import { Button } from '../../components/ui'
import {
  getBrandAndModelSuggestions,
  requestPageCopy,
  todayISODate,
} from '../../data/request-page'
import { RequestField } from './RequestField'

type VisitFields = {
  name: string
  contact: string
  date: string
  time: string
  brandOrModel: string
  showroom: string
}

type VisitErrors = Partial<Record<keyof VisitFields | 'combo', string>>

type RequestVisitFormProps = {
  panelId: string
  labelledBy: string
  initialBrandOrModel: string
  initialShowroom?: string
}

function validate(fields: VisitFields): VisitErrors {
  const errors: VisitErrors = {}
  if (!fields.name.trim()) errors.name = requestPageCopy.errorRequired
  if (!fields.contact.trim()) errors.contact = requestPageCopy.errorRequired
  if (!fields.date && !fields.time) {
    errors.combo = requestPageCopy.errorNeedDateOrTime
  }
  if (fields.date && fields.date < todayISODate()) {
    errors.date = requestPageCopy.errorDatePast
  }
  return errors
}

function submitStub(_fields: VisitFields): void {
  void _fields
}

export function RequestVisitForm({
  panelId,
  labelledBy,
  initialBrandOrModel,
  initialShowroom = '',
}: RequestVisitFormProps) {
  const baseId = useId()
  const listId = `${baseId}-brands-models`
  const [fields, setFields] = useState<VisitFields>({
    name: '',
    contact: '',
    date: '',
    time: '',
    brandOrModel: initialBrandOrModel,
    showroom: initialShowroom,
  })
  const [errors, setErrors] = useState<VisitErrors>({})
  const suggestions = getBrandAndModelSuggestions()
  const minDate = todayISODate()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validate(fields)
    setErrors(next)
    if (Object.keys(next).length > 0) return
    submitStub(fields)
  }

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={labelledBy}
      className="request-page__tabpanel"
    >
      <h3 className="request-page__panel-title">{requestPageCopy.visitTitle}</h3>
      <p className="request-page__panel-lead">{requestPageCopy.visitLead}</p>

      <form className="request-page__form" onSubmit={onSubmit} noValidate>
        {initialShowroom ? (
          <RequestField
            id={`${baseId}-showroom`}
            label={requestPageCopy.fieldShowroom}
            name="showroom"
            value={fields.showroom}
            onChange={(showroom) => setFields((p) => ({ ...p, showroom }))}
          />
        ) : null}
        <RequestField
          id={`${baseId}-name`}
          label={requestPageCopy.fieldName}
          name="name"
          autoComplete="name"
          value={fields.name}
          error={errors.name}
          onChange={(name) => setFields((p) => ({ ...p, name }))}
        />
        <RequestField
          id={`${baseId}-contact`}
          label={requestPageCopy.fieldContact}
          name="contact"
          autoComplete="email"
          value={fields.contact}
          error={errors.contact}
          onChange={(contact) => setFields((p) => ({ ...p, contact }))}
        />
        <RequestField
          id={`${baseId}-date`}
          label={requestPageCopy.fieldDate}
          name="date"
          type="date"
          min={minDate}
          value={fields.date}
          error={errors.date}
          onChange={(date) => setFields((p) => ({ ...p, date }))}
        />
        <RequestField
          id={`${baseId}-time`}
          label={requestPageCopy.fieldTime}
          name="time"
          type="time"
          value={fields.time}
          error={undefined}
          onChange={(time) => setFields((p) => ({ ...p, time }))}
        />
        {errors.combo && !fields.date && !fields.time ? (
          <p className="request-page__error" role="alert">
            {errors.combo}
          </p>
        ) : null}
        <RequestField
          id={`${baseId}-brand`}
          label={requestPageCopy.fieldBrandOrModel}
          name="brandOrModel"
          list={listId}
          value={fields.brandOrModel}
          onChange={(brandOrModel) =>
            setFields((p) => ({ ...p, brandOrModel }))
          }
        />
        <datalist id={listId}>
          {suggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        <div className="request-page__actions">
          <Button type="submit" variant="primary" fullWidthMobile>
            {requestPageCopy.submit}
          </Button>
        </div>
      </form>
    </div>
  )
}
