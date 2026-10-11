import { Link } from 'react-router-dom'

/** Link для внутренних путей и обычный <a> для якорей / внешних URL */
export default function AppLink({ to, children, ...rest }) {
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
