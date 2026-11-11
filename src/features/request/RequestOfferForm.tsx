import { type FormEvent, useId, useState } from 'react'
import { Button } from '../../components/ui'
import {
  getModelSuggestions,
  requestPageCopy,
} from '../../data/request-page'
import { RequestField } from './RequestField'

type OfferFields = {
  name: string
  contact: string
  model: string
  comment: string
}

type OfferErrors = Partial<Record<keyof OfferFields | 'combo', string>>

type RequestOfferFormProps = {
  panelId: string
  labelledBy: string
  initialModel: string
}

function validate(fields: OfferFields): OfferErrors {
  const errors: OfferErrors = {}
  if (!fields.name.trim()) errors.name = requestPageCopy.errorRequired
  if (!fields.contact.trim()) errors.contact = requestPageCopy.errorRequired
  if (!fields.model.trim() && !fields.comment.trim()) {
    errors.combo = requestPageCopy.errorNeedModelOrComment
  }
  return errors
}

function submitStub(_fields: OfferFields): void {
  void _fields
}

export function RequestOfferForm({
  panelId,
  labelledBy,
  initialModel,
}: RequestOfferFormProps) {
  const baseId = useId()
  const listId = `${baseId}-models`
  const [fields, setFields] = useState<OfferFields>({
    name: '',
    contact: '',
    model: initialModel,
    comment: '',
  })
  const [errors, setErrors] = useState<OfferErrors>({})
  const suggestions = getModelSuggestions()

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
      <form className="request-page__form" onSubmit={onSubmit} noValidate>
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
          id={`${baseId}-model`}
          label={requestPageCopy.fieldModel}
          name="model"
          list={listId}
          value={fields.model}
          error={errors.combo}
          onChange={(model) => setFields((p) => ({ ...p, model }))}
        />
        <datalist id={listId}>
          {suggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        <RequestField
          id={`${baseId}-comment`}
          label={requestPageCopy.fieldComment}
          name="comment"
          multiline
          rows={4}
          value={fields.comment}
          onChange={(comment) => setFields((p) => ({ ...p, comment }))}
        />
        <div className="request-page__actions">
          <Button type="submit" variant="primary" fullWidthMobile>
            {requestPageCopy.submit}
          </Button>
        </div>
      </form>
    </div>
  )
}
