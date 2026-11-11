import type { ChangeEvent, HTMLInputTypeAttribute } from 'react'

type AccountFieldProps = {
  id: string
  label: string
  name: string
  value: string
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  error?: string
  onChange: (value: string) => void
}

export function AccountField({
  id,
  label,
  name,
  value,
  type = 'text',
  autoComplete,
  error,
  onChange,
}: AccountFieldProps) {
  const errorId = error ? `${id}-err` : undefined

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  return (
    <div className="account-page__field">
      <label className="account-page__field-label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={[
          'account-page__control',
          error ? 'is-error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        onChange={handleChange}
      />
      {error ? (
        <p id={errorId} className="account-page__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
