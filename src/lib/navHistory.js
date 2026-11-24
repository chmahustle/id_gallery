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

/* Выбранное исполнение модели — в рамках сессии (вкладки) */
const FINISH_STORE = 'idg-finish'

export function saveFinish(productSlug, finishId) {
  try {
    const store = JSON.parse(sessionStorage.getItem(FINISH_STORE) || '{}')
    store[productSlug] = finishId
    sessionStorage.setItem(FINISH_STORE, JSON.stringify(store))
  } catch {
    /* sessionStorage недоступен — исполнение не восстановится */
  }
}

export function readFinish(productSlug) {
  try {
    const value = JSON.parse(sessionStorage.getItem(FINISH_STORE) || '{}')[productSlug]
    return typeof value === 'string' ? value : null
  } catch {
    return null
  }
}

/* Последний запрос в панели поиска — в рамках сессии */
const SEARCH_STORE = 'idg-search'

export function saveSearchQuery(query) {
  try {
    if (query) sessionStorage.setItem(SEARCH_STORE, query)
    else sessionStorage.removeItem(SEARCH_STORE)
  } catch {
    /* sessionStorage недоступен */
  }
}

export function readSearchQuery() {
  try {
    return sessionStorage.getItem(SEARCH_STORE) || ''
  } catch {
    return ''
  }
}
