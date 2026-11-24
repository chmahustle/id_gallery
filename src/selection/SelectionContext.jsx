import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * «Моя подборка» в личном кабинете. Позиция = модель + выбранное исполнение,
 * без количества (количество — в корзине). Повторное сохранение не создаёт дубль.
 * Удаление из подборки корзину не трогает.
 */
const STORAGE_KEY = 'idg-selection'
const SelectionContext = createContext(null)

function positionId(slug, variantId) {
  return variantId ? `${slug}::${variantId}` : slug
}

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const items = Array.isArray(parsed.items)
      ? parsed.items.filter((item) => item && typeof item.slug === 'string')
      : []
    return {
      items: items.map((item) => ({
        id: positionId(item.slug, item.variantId || ''),
        slug: item.slug,
        variantId: item.variantId || '',
        forRequest: item.forRequest !== false,
      })),
      comment: typeof parsed.comment === 'string' ? parsed.comment : '',
    }
  } catch {
    return { items: [], comment: '' }
  }
}

export function SelectionProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota */
    }
  }, [state])

  const save = useCallback((slug, variantId = '') => {
    const id = positionId(slug, variantId)
    setState((current) =>
      current.items.some((item) => item.id === id)
        ? current
        : {
            ...current,
            items: [...current.items, { id, slug, variantId, forRequest: true }],
          },
    )
  }, [])

  const has = useCallback(
    (slug, variantId = '') =>
      state.items.some((item) => item.id === positionId(slug, variantId)),
    [state.items],
  )

  const remove = useCallback((id) => {
    setState((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== id),
    }))
  }, [])

  const toggleRequest = useCallback((id) => {
    setState((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, forRequest: !item.forRequest } : item,
      ),
    }))
  }, [])

  const setComment = useCallback((comment) => {
    setState((current) => ({ ...current, comment }))
  }, [])

  const clear = useCallback(() => setState({ items: [], comment: '' }), [])

  const value = useMemo(
    () => ({
      items: state.items,
      comment: state.comment,
      save,
      has,
      remove,
      toggleRequest,
      setComment,
      clear,
    }),
    [state, save, has, remove, toggleRequest, setComment, clear],
  )

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>
}

export function useSelection() {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider')
  return ctx
}
