import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api } from '../api'
import {
  TEXT_SLOTS,
  buildContent,
  getDefaultTextMap,
} from './textDefaults'

const ContentContext = createContext(null)

export function ContentProvider({ children }) {
  const defaults = useMemo(() => getDefaultTextMap(), [])
  const [overrides, setOverrides] = useState({})
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const data = await api('/api/texts')
    const raw = data.overrides || {}
    setOverrides(
      Object.fromEntries(
        Object.entries(raw).filter(
          ([id, value]) => id in defaults && typeof value === 'string',
        ),
      ),
    )
    setReady(true)
  }, [defaults])

  useEffect(() => {
    refresh().catch((err) => {
      console.error(err)
      setReady(true)
    })
  }, [refresh])

  const texts = useMemo(
    () => ({ ...defaults, ...overrides }),
    [defaults, overrides],
  )

  const content = useMemo(() => buildContent(texts), [texts])

  const setManyTexts = useCallback(async (patch) => {
    const data = await api('/api/texts', {
      method: 'PUT',
      body: JSON.stringify({ texts: patch }),
    })
    setOverrides(data.overrides || {})
  }, [])

  const resetText = useCallback(async (id) => {
    const data = await api(`/api/texts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    setOverrides(data.overrides || {})
  }, [])

  const resetAllTexts = useCallback(async () => {
    const data = await api('/api/texts', { method: 'DELETE' })
    setOverrides(data.overrides || {})
  }, [])

  const value = useMemo(
    () => ({
      ready,
      slots: TEXT_SLOTS,
      texts,
      overrides,
      defaults,
      content,
      setManyTexts,
      resetText,
      resetAllTexts,
      refresh,
    }),
    [
      ready,
      texts,
      overrides,
      defaults,
      content,
      setManyTexts,
      resetText,
      resetAllTexts,
      refresh,
    ],
  )

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  )
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}
