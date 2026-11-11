import { type FormEvent, useId, useState } from 'react'
import { Button } from '../../components/ui'
import { accountPageCopy, isValidEmail } from '../../data/account-page'
import { AccountField } from './AccountField'

type LoginFields = { email: string; password: string }
type LoginErrors = Partial<Record<keyof LoginFields, string>>

function validate(fields: LoginFields): LoginErrors {
  const errors: LoginErrors = {}
  if (!fields.email.trim()) errors.email = accountPageCopy.errorRequired
  else if (!isValidEmail(fields.email)) errors.email = accountPageCopy.errorEmail
  if (!fields.password) errors.password = accountPageCopy.errorRequired
  return errors
}

/** Заглушка без fetch и без «Вы вошли» */
function submitStub(_fields: LoginFields): void {
  void _fields
}

type AccountLoginFormProps = {
  formHidden?: boolean
}

export function AccountLoginForm({ formHidden = false }: AccountLoginFormProps) {
  const baseId = useId()
  const [fields, setFields] = useState<LoginFields>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginErrors>({})

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = validate(fields)
    setErrors(next)
    if (Object.keys(next).length > 0) return
    submitStub(fields)
  }

  return (
    <form
      className="account-page__form"
      onSubmit={onSubmit}
      noValidate
      hidden={formHidden || undefined}
    >
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
        autoComplete="current-password"
        value={fields.password}
        error={errors.password}
        onChange={(password) => setFields((prev) => ({ ...prev, password }))}
      />
      <div className="account-page__actions">
        <Button type="submit" variant="primary" fullWidthMobile>
          {accountPageCopy.loginSubmit}
        </Button>
      </div>
    </form>
  )
}
