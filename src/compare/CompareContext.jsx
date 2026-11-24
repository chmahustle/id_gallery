import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Сравнение: 2–4 модели одного типа, каждая — с выбранным исполнением.
 * Набор хранится в рамках сессии. Модель другого типа не добавляется,
 * текущий набор остаётся.
 */
const COMPARE_MAX = 4
const STORAGE_KEY = 'idg-compare'
const CompareContext = createContext(null)

function load() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}')
    return {
      categorySlug: typeof parsed.categorySlug === 'string' ? parsed.categorySlug : '',
      items: Array.isArray(parsed.items)
        ? parsed.items.filter((item) => item && typeof item.slug === 'string')
        : [],
    }
  } catch {
    return { categorySlug: '', items: [] }
  }
}

export function CompareProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  /**
   * Добавить модель. Возвращает результат для сообщения рядом с кнопкой:
   * 'added' | 'updated' (другое исполнение той же модели) | 'other-type' | 'full'
   */
  const add = useCallback(
    (product, variantId = '') => {
      const sameType = !state.categorySlug || state.categorySlug === product.categorySlug
      const present = state.items.some((item) => item.slug === product.slug)
      let result = 'added'
      if (!sameType && state.items.length > 0) result = 'other-type'
      else if (present) result = 'updated'
      else if (state.items.length >= COMPARE_MAX) result = 'full'

      if (result === 'added' || result === 'updated') {
        setState((current) => {
          const items = current.items.some((item) => item.slug === product.slug)
            ? current.items.map((item) =>
                item.slug === product.slug ? { ...item, variantId } : item,
              )
            : [...current.items, { slug: product.slug, variantId }]
          return { categorySlug: product.categorySlug, items }
        })
      }
      return result
    },
    [state],
  )

  const remove = useCallback((slug) => {
    setState((current) => {
      /* тип остаётся и при пустом наборе: «Добавьте ещё…» ведёт в каталог этого типа */
      return { ...current, items: current.items.filter((item) => item.slug !== slug) }
    })
  }, [])

  const has = useCallback(
    (slug) => state.items.some((item) => item.slug === slug),
    [state.items],
  )

  const value = useMemo(
    () => ({
      items: state.items,
      categorySlug: state.categorySlug,
      add,
      remove,
      has,
    }),
    [state, add, remove, has],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}
