import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../api'
import { TEXT_SLOTS, buildContent, getDefaultTextMap } from './textDefaults'

type TextMap = Record<string, string>
type TextsResponse = { overrides?: TextMap }

/** Тексты сайта (вкладка «Тексты») и собранное из них содержимое */
export type ContentValue = {
  ready: boolean
  slots: typeof TEXT_SLOTS
  texts: TextMap
  overrides: TextMap
  defaults: TextMap
  content: ReturnType<typeof buildContent>
  setManyTexts: (patch: TextMap) => Promise<void>
  resetText: (id: string) => Promise<void>
  resetAllTexts: () => Promise<void>
  refresh: () => Promise<void>
}

const ContentContext = createContext<ContentValue | null>(null)

export function ContentProvider({ children }: { children: ReactNode }) {
  const defaults = useMemo(() => getDefaultTextMap() as TextMap, [])
  const [overrides, setOverrides] = useState<TextMap>({})
  const [ready, setReady] = useState(false)

  const refresh = useCallback(async () => {
    const data = await api<TextsResponse>('/api/texts')
    const raw = data.overrides || {}
    setOverrides(
      Object.fromEntries(
        Object.entries(raw).filter(
          ([id, value]: [string, unknown]) => id in defaults && typeof value === 'string',
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

  const texts = useMemo(() => ({ ...defaults, ...overrides }), [defaults, overrides])

  const content = useMemo(() => buildContent(texts), [texts])

  const setManyTexts = useCallback(async (patch: TextMap) => {
    const data = await api<TextsResponse>('/api/texts', {
      method: 'PUT',
      body: JSON.stringify({ texts: patch }),
    })
    setOverrides(data.overrides || {})
  }, [])

  const resetText = useCallback(async (id: string) => {
    const data = await api<TextsResponse>(`/api/texts/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    setOverrides(data.overrides || {})
  }, [])

  const resetAllTexts = useCallback(async () => {
    const data = await api<TextsResponse>('/api/texts', { method: 'DELETE' })
    setOverrides(data.overrides || {})
  }, [])

  const value = useMemo<ContentValue>(
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
    [ready, texts, overrides, defaults, content, setManyTexts, resetText, resetAllTexts, refresh],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used within ContentProvider')
  return ctx
}
