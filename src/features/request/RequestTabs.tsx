import { useCallback, useRef, type KeyboardEvent } from 'react'
import { requestPageCopy, type RequestType } from '../../data/request-page'

type RequestTabsProps = {
  baseId: string
  type: RequestType
  onChange: (type: RequestType) => void
}

export function RequestTabs({ baseId, type, onChange }: RequestTabsProps) {
  const offerId = `${baseId}-offer`
  const visitId = `${baseId}-visit`
  const listRef = useRef<HTMLDivElement>(null)

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      event.preventDefault()
      const next: RequestType =
        event.key === 'ArrowRight'
          ? type === 'offer'
            ? 'visit'
            : 'offer'
          : type === 'visit'
            ? 'offer'
            : 'visit'
      onChange(next)
      const btn = listRef.current?.querySelector<HTMLButtonElement>(
        `[data-type="${next}"]`,
      )
      btn?.focus()
    },
    [onChange, type],
  )

  return (
    <div
      ref={listRef}
      className="request-page__tabs"
      role="tablist"
      aria-label={requestPageCopy.heroTitle}
      onKeyDown={onKeyDown}
    >
      <button
        type="button"
        role="tab"
        id={offerId}
        data-type="offer"
        className={[
          'request-page__tab',
          type === 'offer' ? 'is-active' : '',
        ].join(' ')}
        aria-selected={type === 'offer'}
        aria-controls={`${baseId}-panel-offer`}
        tabIndex={type === 'offer' ? 0 : -1}
        onClick={() => onChange('offer')}
      >
        {requestPageCopy.tabOffer}
      </button>
      <button
        type="button"
        role="tab"
        id={visitId}
        data-type="visit"
        className={[
          'request-page__tab',
          type === 'visit' ? 'is-active' : '',
        ].join(' ')}
        aria-selected={type === 'visit'}
        aria-controls={`${baseId}-panel-visit`}
        tabIndex={type === 'visit' ? 0 : -1}
        onClick={() => onChange('visit')}
      >
        {requestPageCopy.tabVisit}
      </button>
    </div>
  )
}
