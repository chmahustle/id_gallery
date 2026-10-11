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
import {
  getAdjacentNews as getAdjacentFromList,
  getNewsBySlug as getBySlugFromList,
  news as defaultNews,
  newsCategories,
  newsPath,
} from '../content'

const NewsContext = createContext(null)

export function NewsProvider({ children }) {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)
  const loadedRef = useRef(false)

  const reload = useCallback(async () => {
    try {
      const data = await api('/api/news')
      if (Array.isArray(data.items)) {
        setItems(data.items)
        loadedRef.current = true
      }
    } catch {
      if (!loadedRef.current) setItems(defaultNews)
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const getNewsBySlug = useCallback(
    (slug) => getBySlugFromList(slug, items),
    [items],
  )

  const getAdjacentNews = useCallback(
    (slug) => getAdjacentFromList(slug, items),
    [items],
  )

  const value = useMemo(
    () => ({
      items,
      ready,
      categories: newsCategories,
      reload,
      getNewsBySlug,
      getAdjacentNews,
      newsPath,
    }),
    [items, ready, reload, getNewsBySlug, getAdjacentNews],
  )

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>
}

export function useNews() {
  const ctx = useContext(NewsContext)
  if (!ctx) throw new Error('useNews must be used within NewsProvider')
  return ctx
}
