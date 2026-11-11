import { type LabelHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type LabelProps = {
  className?: string
  children: ReactNode
} & LabelHTMLAttributes<HTMLLabelElement>

export function Label({ className, children, ...rest }: LabelProps) {
  return (
    <label
      className={cn(
        'font-display text-label font-normal uppercase tracking-label text-text-secondary',
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  )
}
