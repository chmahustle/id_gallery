const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
    (el) =>
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      el.tabIndex !== -1 &&
      el.offsetParent !== null,
  )
}

/** Циклический Tab внутри контейнера. Возвращает true, если событие перехвачено. */
export function handleFocusTrapKeyDown(
  container: HTMLElement,
  event: KeyboardEvent,
): boolean {
  if (event.key !== 'Tab') return false
  const items = getFocusableElements(container)
  if (items.length === 0) {
    event.preventDefault()
    return true
  }
  const first = items[0]
  const last = items[items.length - 1]
  const active = document.activeElement as HTMLElement | null

  if (event.shiftKey) {
    if (active === first || !container.contains(active)) {
      event.preventDefault()
      last.focus()
      return true
    }
  } else if (active === last || !container.contains(active)) {
    event.preventDefault()
    first.focus()
    return true
  }
  return false
}
