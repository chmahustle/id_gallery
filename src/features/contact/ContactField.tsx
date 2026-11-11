import type { ChangeEvent } from 'react'

type ContactFieldProps = {
  id: string
  label: string
  name: string
  value: string
  error?: string
  autoComplete?: string
  multiline?: boolean
  rows?: number
  placeholder?: string
  onChange: (value: string) => void
}

export function ContactField({
  id,
  label,
  name,
  value,
  error,
  autoComplete,
  multiline = false,
  rows = 5,
  placeholder,
  onChange,
}: ContactFieldProps) {
  const errorId = error ? `${id}-err` : undefined

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    onChange(event.target.value)
  }

  return (
    <div className="contact-page__field">
      <label className="contact-page__field-label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className={[
            'contact-page__control',
            'contact-page__control--area',
            error ? 'is-error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          name={name}
          rows={rows}
          placeholder={placeholder}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={handleChange}
        />
      ) : (
        <input
          id={id}
          className={[
            'contact-page__control',
            error ? 'is-error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          type="text"
          name={name}
          autoComplete={autoComplete}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={handleChange}
        />
      )}
      {error ? (
        <p id={errorId} className="contact-page__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
