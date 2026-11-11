import { type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

type TextLinkBase = {
  className?: string
  children: ReactNode
  arrow?: boolean
}

type InternalLink = TextLinkBase & {
  to: string
  href?: never
} & Omit<ComponentPropsWithoutRef<typeof Link>, 'to' | 'className' | 'children'>

type ExternalLink = TextLinkBase & {
  href: string
  to?: never
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className' | 'children'>

export type TextLinkProps = InternalLink | ExternalLink

export function TextLink(props: TextLinkProps) {
  const { className, children, arrow = false, ...rest } = props
  const classes = cn(
    'font-display text-label uppercase tracking-label text-text-primary',
    'underline-offset-[0.28em] hover:underline',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
    className,
  )

  const content = (
    <>
      {children}
      {arrow ? <span aria-hidden="true"> →</span> : null}
    </>
  )

  if ('to' in props && props.to) {
    const { to, ...linkRest } = rest as Omit<InternalLink, keyof TextLinkBase>
    return (
      <Link to={to} className={classes} {...linkRest}>
        {content}
      </Link>
    )
  }

  const { href, ...anchorRest } = rest as Omit<ExternalLink, keyof TextLinkBase>
  return (
    <a href={href} className={classes} {...anchorRest}>
      {content}
    </a>
  )
}
