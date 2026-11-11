import {
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { useRevealOnce } from '../../lib/useRevealOnce'
import { cn } from '../../lib/cn'

type RevealProps = {
  as?: ElementType
  className?: string
  /** Stagger children fade-up */
  stagger?: boolean
  children: ReactNode
} & HTMLAttributes<HTMLElement>

/** Появление блока при скролле (один раз). */
export function Reveal({
  as: Tag = 'div',
  className,
  stagger = false,
  children,
  ...rest
}: RevealProps) {
  const { nodeRef, revealed } = useRevealOnce()

  return (
    <Tag
      ref={nodeRef}
      className={cn(
        stagger ? 'ig-reveal-stagger' : 'ig-reveal',
        revealed && 'is-in',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
