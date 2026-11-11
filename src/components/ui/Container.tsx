import { type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ContainerProps = {
  as?: ElementType
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLElement>

export function Container({
  as: Tag = 'div',
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full max-w-[var(--page-max)] px-[var(--page-gutter)]',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
