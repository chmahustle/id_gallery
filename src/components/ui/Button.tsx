import {
  type ButtonHTMLAttributes,
  type ComponentPropsWithoutRef,
  type ReactNode,
  type Ref,
  forwardRef,
} from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '../../lib/cn'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'inverse' | 'link'

type CommonProps = {
  variant?: ButtonVariant
  /** Стрелка справа — только для переходов */
  withArrow?: boolean
  /** На узких экранах — ширина 100% (высота 40px сохраняется) */
  fullWidthMobile?: boolean
  /** Для link: подчёркивание только при hover / current */
  subtle?: boolean
  className?: string
  children: ReactNode
  disabled?: boolean
}

type AsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'disabled'> & {
    as?: 'button'
    to?: never
    href?: never
  }

type AsAnchor = CommonProps &
  Omit<ComponentPropsWithoutRef<'a'>, 'children'> & {
    as: 'a'
    href: string
    to?: never
  }

type AsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, 'children' | 'to'> & {
    as: typeof Link | 'link'
    to: string
    href?: never
  }

export type ButtonProps = AsButton | AsAnchor | AsLink

function ButtonContent({
  children,
  withArrow,
}: {
  children: ReactNode
  withArrow?: boolean
}) {
  return (
    <>
      <span className="ui-btn__label">{children}</span>
      {withArrow ? (
        <ArrowRight className="ui-btn__arrow" size={16} aria-hidden="true" />
      ) : null}
    </>
  )
}

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(function Button(props, ref) {
  const {
    variant = 'primary',
    withArrow = false,
    fullWidthMobile = false,
    subtle = false,
    className,
    children,
    disabled,
    as = 'button',
    ...rest
  } = props

  const classes = cn(
    'ui-btn',
    `ui-btn--${variant}`,
    variant === 'link' && subtle && 'ui-btn--link-subtle',
    fullWidthMobile && variant !== 'link' && 'ui-btn--block-sm',
    className,
  )

  const content = (
    <ButtonContent withArrow={withArrow}>{children}</ButtonContent>
  )

  if (as === 'a') {
    const anchorProps = rest as Omit<AsAnchor, keyof CommonProps | 'as'>
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        className={classes}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        {...anchorProps}
      >
        {content}
      </a>
    )
  }

  if (as === Link || as === 'link') {
    const linkProps = rest as Omit<AsLink, keyof CommonProps | 'as'>
    return (
      <Link
        ref={ref as Ref<HTMLAnchorElement>}
        className={classes}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        {...linkProps}
      >
        {content}
      </Link>
    )
  }

  const buttonProps = rest as Omit<AsButton, keyof CommonProps | 'as'>
  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type={buttonProps.type ?? 'button'}
      className={classes}
      disabled={disabled}
      {...buttonProps}
    >
      {content}
    </button>
  )
})
