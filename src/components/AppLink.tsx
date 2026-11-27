import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to?: string
  children?: ReactNode
}

/** Link для внутренних путей и обычный <a> для якорей / внешних URL */
export default function AppLink({ to, children, ...rest }: AppLinkProps) {
  const href = to || '#'
  // `/#section` и чистые `#section` — через <a>, иначе React Router не доскроллит
  if (href.startsWith('/') && !href.includes('#')) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  )
}
