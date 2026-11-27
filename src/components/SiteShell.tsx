import type { ReactNode } from 'react'
import { Header, type HeaderProps } from './header/Header'
import Footer from './Footer'

type SiteShellProps = {
  variant?: NonNullable<HeaderProps['variant']>
  children?: ReactNode
}

export default function SiteShell({ variant = 'overlay', children }: SiteShellProps) {
  return (
    <div className={`page page--${variant}`}>
      <a href="#main" className="skip-link">
        Перейти к содержимому
      </a>
      <Header variant={variant} />
      <main id="main">{children}</main>
      <Footer />
    </div>
  )
}
