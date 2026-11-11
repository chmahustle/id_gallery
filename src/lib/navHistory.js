/**
 * Запоминает предыдущую страницу внутри сайта и положение прокрутки каждой
 * записи истории (по location.key), чтобы вернуть пользователя на то же место.
 */
const SCROLL_STORE = 'idg-scroll'

let current = null
let previous = null

export function trackLocation(location) {
  if (current && current.key === location.key) return
  previous = current
  current = {
    key: location.key,
    pathname: location.pathname,
    search: location.search,
  }
}

/** Страница, с которой пользователь пришёл на текущую (внутри сайта) */
export function getPreviousLocation() {
  return previous
}

function readStore() {
  try {
    return JSON.parse(sessionStorage.getItem(SCROLL_STORE) || '{}')
  } catch {
    return {}
  }
}

export function saveScroll(key, y) {
  try {
    const store = readStore()
    store[key] = Math.round(y)
    sessionStorage.setItem(SCROLL_STORE, JSON.stringify(store))
  } catch {
    /* sessionStorage недоступен — прокрутка просто не восстановится */
  }
}

export function readScroll(key) {
  const value = readStore()[key]
  return typeof value === 'number' ? value : null
}
