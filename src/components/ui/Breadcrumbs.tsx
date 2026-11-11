import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

export type BreadcrumbItem = {
  label: string
  to?: string
}

export type BreadcrumbsProps = {
  items: BreadcrumbItem[]
  className?: string
  separator?: ReactNode
  'aria-label'?: string
}

export function Breadcrumbs({
  items,
  className,
  separator = '-',
  'aria-label': ariaLabel = 'Хлебные крошки',
}: BreadcrumbsProps) {
  return (
    <nav aria-label={ariaLabel} className={cn(className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 font-body text-caption font-light tracking-[-0.01em] text-text-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? (
                <li aria-hidden="true" className="text-text-muted">
                  {separator}
                </li>
              ) : null}
              <li>
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className="hover:text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={isLast ? 'text-text-secondary' : undefined}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
