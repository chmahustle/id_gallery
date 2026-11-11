import { useCallback, useRef, type KeyboardEvent } from 'react'
import { accountPageCopy, type AccountTab } from '../../data/account-page'

type AccountTabsProps = {
  baseId: string
  tab: AccountTab
  onChange: (tab: AccountTab) => void
}

export function AccountTabs({ baseId, tab, onChange }: AccountTabsProps) {
  const loginId = `${baseId}-login`
  const registerId = `${baseId}-register`
  const listRef = useRef<HTMLDivElement>(null)

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      const next: AccountTab =
        event.key === 'ArrowRight'
          ? tab === 'login'
            ? 'register'
            : 'login'
          : tab === 'register'
            ? 'login'
            : 'register'
      onChange(next)
      const btn = listRef.current?.querySelector<HTMLButtonElement>(
        `[data-tab="${next}"]`,
      )
      btn?.focus()
    },
    [onChange, tab],
  )

  return (
    <div
      ref={listRef}
      className="account-page__tabs"
      role="tablist"
      aria-label={accountPageCopy.heroTitle}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        role="tab"
        id={loginId}
        data-tab="login"
        className={[
          'account-page__tab',
          tab === 'login' ? 'is-active' : '',
        ].join(' ')}
        aria-selected={tab === 'login'}
        aria-controls={`${baseId}-panel-login`}
        tabIndex={tab === 'login' ? 0 : -1}
        onClick={() => onChange('login')}
      >
        {accountPageCopy.loginTitle}
      </button>
      <button
        type="button"
        role="tab"
        id={registerId}
        data-tab="register"
        className={[
          'account-page__tab',
          tab === 'register' ? 'is-active' : '',
        ].join(' ')}
        aria-selected={tab === 'register'}
        aria-controls={`${baseId}-panel-register`}
        tabIndex={tab === 'register' ? 0 : -1}
        onClick={() => onChange('register')}
      >
        {accountPageCopy.registerTitle}
      </button>
    </div>
  )
}
