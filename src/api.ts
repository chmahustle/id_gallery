/** Ответ API с ошибкой: текст для показа в интерфейсе */
async function parseJson(res: Response) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Ошибка запроса (${res.status})`)
  }
  return data
}

/**
 * Запрос к API сайта: cookie сессии, JSON по умолчанию.
 * Тип ответа задаёт вызывающий код: api<{ user: User }>('/api/account/me').
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  return fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
  }).then(parseJson)
}
