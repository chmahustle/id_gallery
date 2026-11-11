import {
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
} from 'react'
import { cn } from '../../lib/cn'
import { Label } from './Label'

type FieldShared = {
  label: string
  hint?: string
  error?: string
  className?: string
  hideLabel?: boolean
}

export type InputProps = FieldShared &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
    multiline?: false
  }

export type TextareaProps = FieldShared &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
    multiline: true
  }

export type FieldProps = InputProps | TextareaProps

const controlClass =
  'w-full border-0 border-b border-border-strong bg-transparent py-2 font-body text-body font-light text-text-primary placeholder:text-text-muted focus:border-ink focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-40'

export function Field({
  label,
  hint,
  error,
  className,
  hideLabel = false,
  id: idProp,
  ...rest
}: FieldProps) {
  const autoId = useId()
  const id = idProp ?? autoId
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint && !error ? `${id}-hint` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  let control: ReactNode
  if ('multiline' in rest && rest.multiline) {
    const { multiline: _ignored, ...areaRest } = rest
    void _ignored
    control = (
      <textarea
        id={id}
        className={cn(controlClass, 'min-h-24 resize-y', error && 'border-error')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...areaRest}
      />
    )
  } else {
    const { multiline: _ignored, ...inputRest } = rest as InputProps
    void _ignored
    control = (
      <input
        id={id}
        className={cn(controlClass, error && 'border-error')}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputRest}
      />
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id} className={hideLabel ? 'sr-only' : undefined}>
        {label}
      </Label>
      {control}
      {error ? (
        <p id={errorId} role="alert" className="font-body text-caption text-error">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p id={hintId} className="font-body text-caption text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export function Input(props: InputProps) {
  return <Field {...props} multiline={false} />
}
