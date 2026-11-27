import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../api'
import {
  getAdjacentNews as getAdjacentFromList,
  getNewsBySlug as getBySlugFromList,
  news as defaultNews,
  newsPath,
} from '../content'

/** Событие (раздел «Журнал») — как его отдаёт API */
export type NewsArticle = {
  id?: number
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  image: string
  images?: { src: string; caption?: string }[]
  body?: string[]
  ctaLabel?: string
  ctaHref?: string
  /** false — кнопки на странице события нет (текст и ссылка сохраняются) */
  showCta?: boolean
  externalUrl?: string
  videoUrl?: string
  published?: boolean
}

export type NewsValue = {
  items: NewsArticle[]
  ready: boolean
  categories: string[]
  reload: () => Promise<void>
  getNewsBySlug: (slug: string) => NewsArticle | null
  getAdjacentNews: (slug: string) => { prev: NewsArticle | null; next: NewsArticle | null }
  newsPath: (slug: string) => string
}

const NewsContext = createContext<NewsValue | null>(null)

export function NewsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NewsArticle[]>([])
  const [ready, setReady] = useState(false)
  const loadedRef = useRef(false)

  const reload = useCallback(async () => {
    try {
      const data = await api<{ items?: NewsArticle[] }>('/api/news')
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

  const getNewsBySlug = useCallback((slug: string) => getBySlugFromList(slug, items), [items])

  const getAdjacentNews = useCallback((slug: string) => getAdjacentFromList(slug, items), [items])

  /* вкладки журнала — категории самих событий; одна категория — без вкладок */
  const categories = useMemo(() => {
    const names = [...new Set(items.map((item) => item.category).filter(Boolean))]
    return names.length > 1 ? ['Все', ...names] : []
  }, [items])

  const value = useMemo<NewsValue>(
    () => ({
      items,
      ready,
      categories,
      reload,
      getNewsBySlug,
      getAdjacentNews,
      newsPath,
    }),
    [items, ready, categories, reload, getNewsBySlug, getAdjacentNews],
  )

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>
}

export function useNews() {
  const ctx = useContext(NewsContext)
  if (!ctx) throw new Error('useNews must be used within NewsProvider')
  return ctx
}
