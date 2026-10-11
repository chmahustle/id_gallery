import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { api } from '../api'
import { brandLogos as defaultBrands } from '../content'

const BrandsContext = createContext(null)

export function BrandsProvider({ children }) {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const loadedRef = useRef(false)

  const reload = useCallback(async () => {
    try {
      const data = await api('/api/brands')
      if (Array.isArray(data.items)) {
        setItems(data.items)
        loadedRef.current = true
      }
    } catch {
      if (!loadedRef.current) setItems(defaultBrands)
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const names = useMemo(() => items.map((item) => item.name), [items])

  const value = useMemo(
    () => ({
      items,
      names,
      ready,
      reload,
    }),
    [items, names, ready, reload],
  )

  return (
    <BrandsContext.Provider value={value}>{children}</BrandsContext.Provider>
  )
}

export function useBrands() {
  const ctx = useContext(BrandsContext)
  if (!ctx) throw new Error('useBrands must be used within BrandsProvider')
  return ctx
}
