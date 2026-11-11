import { type ReactNode } from 'react'
import './PageShell.css'

type PageShellProps = {
  children: ReactNode
  className?: string
}

/**
 * Обёртка страниц без hero: единый зазор шапка → контент через --page-top-offset.
 * .page--solid уже компенсирует высоту fixed-шапки (--header-offset).
 */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={['page-shell', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  )
}
