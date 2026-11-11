import { type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type SectionProps = {
  as?: ElementType
  className?: string
  children: ReactNode
  compact?: boolean
} & HTMLAttributes<HTMLElement>

export function Section({
  as: Tag = 'section',
  className,
  children,
  compact = false,
  ...rest
}: SectionProps) {
  return (
    <Tag
      className={cn(
        compact
          ? 'py-[calc(var(--section-space)*0.55)]'
          : 'py-[var(--section-space)]',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
