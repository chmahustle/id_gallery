import type { ReactNode } from 'react'
import './BannerStack.css'

type BannerStackProps = {
  children: ReactNode
  className?: string
}

/** Лента баннеров с зазором 14px Snow Ivory */
export function BannerStack({ children, className }: BannerStackProps) {
  return (
    <div className={['banner-stack', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
