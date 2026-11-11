/**
 * Заполнять только утверждёнными материалами.
 * Пока showNews = false — массив пуст, выдуманных новостей в репозитории нет.
 */
export type NewsItem = {
  slug: string
  title: string
  date: string
  excerpt?: string
  category?: string
  image?: string
  body?: string
}

export const news: NewsItem[] = []

export const newsCategories: string[] = []

export function newsPath(slug: string) {
  return `/news/${slug}`
}

export function getNewsBySlug(slug: string, list: NewsItem[] = news) {
  return list.find((item) => item.slug === slug) || null
}

export function getAdjacentNews(slug: string, list: NewsItem[] = news) {
  const index = list.findIndex((item) => item.slug === slug)
  if (index < 0) return { prev: null, next: null }
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  }
}
