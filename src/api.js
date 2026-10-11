async function parseJson(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Ошибка запроса (${res.status})`)
  }
  return data
}

export function api(path, options = {}) {
  return fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  }).then(parseJson)
}
