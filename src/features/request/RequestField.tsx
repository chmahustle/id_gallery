import type { ChangeEvent, HTMLInputTypeAttribute } from 'react'

type RequestFieldProps = {
  id: string
  label: string
  name: string
  value: string
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  error?: string
  multiline?: boolean
  rows?: number
  list?: string
  min?: string
  onChange: (value: string) => void
}

export function RequestField({
  id,
  label,
  name,
  value,
  type = 'text',
  autoComplete,
  error,
  multiline = false,
  rows = 4,
  list,
  min,
  onChange,
}: RequestFieldProps) {
  const errorId = error ? `${id}-err` : undefined

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    onChange(event.target.value)
  }

  return (
    <div className="request-page__field">
      <label className="request-page__field-label" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          className={[
            'request-page__control',
            'request-page__control--area',
            error ? 'is-error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          name={name}
          rows={rows}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={handleChange}
        />
      ) : (
        <input
          id={id}
          className={[
            'request-page__control',
            type === 'date' || type === 'time' ? 'request-page__control--picker' : '',
            error ? 'is-error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          type={type}
          name={name}
          autoComplete={autoComplete}
          list={list}
          min={min}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          onChange={handleChange}
        />
      )}
      {error ? (
        <p id={errorId} className="request-page__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
