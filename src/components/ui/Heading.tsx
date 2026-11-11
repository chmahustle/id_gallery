import { type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

type HeadingLevel = 1 | 2 | 3

export type HeadingProps = {
  level: HeadingLevel
  as?: ElementType
  className?: string
  children: ReactNode
} & HTMLAttributes<HTMLHeadingElement>

const levelClass: Record<HeadingLevel, string> = {
  1: 'text-h1',
  2: 'text-h2',
  3: 'text-h3',
}

export function Heading({
  level,
  as,
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = (as ?? (`h${level}` as ElementType)) as ElementType

  return (
    <Tag
      className={cn(
        'font-display font-medium uppercase tracking-[0.02em] leading-[0.95] text-text-primary',
        levelClass[level],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
