import { type FormEvent, useId, useState } from 'react'
import { Button } from '../../components/ui'
import { accountPageCopy, isValidEmail } from '../../data/account-page'
import { AccountField } from './AccountField'

type RegisterFields = { name: string; email: string; password: string }
type RegisterErrors = Partial<Record<keyof RegisterFields, string>>

function validate(fields: RegisterFields): RegisterErrors {
  const errors: RegisterErrors = {}
  if (!fields.name.trim()) errors.name = accountPageCopy.errorRequired
  if (!fields.email.trim()) errors.email = accountPageCopy.errorRequired
  else if (!isValidEmail(fields.email)) errors.email = accountPageCopy.errorEmail
  if (!fields.password) errors.password = accountPageCopy.errorRequired
  else if (fields.password.length < 8) {
    errors.password = accountPageCopy.errorPasswordShort
  }
  return errors
}

/** Заглушка без fetch и без «Спасибо» */
function submitStub(_fields: RegisterFields): void {
  void _fields
}

type AccountRegisterFormProps = {
  formHidden?: boolean
}

export function AccountRegisterForm({
  formHidden = false,
}: AccountRegisterFormProps) {
  const baseId = useId()
  const [fields, setFields] = useState<RegisterFields>({
    name: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<RegisterErrors>({})

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validate(fields)
    setErrors(next)
    if (Object.keys(next).length > 0) return
    submitStub(fields)
  }

  return (
    <>
      <p className="account-page__panel-lead">{accountPageCopy.registerLead}</p>
      <form
        className="account-page__form"
        onSubmit={onSubmit}
        noValidate
        hidden={formHidden || undefined}
      >
        <AccountField
          id={`${baseId}-name`}
          label={accountPageCopy.fieldName}
          name="name"
          autoComplete="name"
          value={fields.name}
          error={errors.name}
          onChange={(name) => setFields((prev) => ({ ...prev, name }))}
        />
        <AccountField
          id={`${baseId}-email`}
          label={accountPageCopy.fieldEmail}
          name="email"
          type="email"
          autoComplete="email"
          value={fields.email}
          error={errors.email}
          onChange={(email) => setFields((prev) => ({ ...prev, email }))}
        />
        <AccountField
          id={`${baseId}-password`}
          label={accountPageCopy.fieldPassword}
          name="password"
          type="password"
          autoComplete="new-password"
          value={fields.password}
          error={errors.password}
          onChange={(password) => setFields((prev) => ({ ...prev, password }))}
        />
        <div className="account-page__actions">
          <Button type="submit" variant="primary" fullWidthMobile>
            {accountPageCopy.registerSubmit}
          </Button>
        </div>
      </form>
    </>
  )
}
