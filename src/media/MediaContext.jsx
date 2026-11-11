import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api } from '../api'
import { getDefaultMap, MEDIA_SLOTS } from './defaults'

const MediaContext = createContext(null)

const MAX_IMAGE_BYTES = 20 * 1024 * 1024
const MAX_VIDEO_BYTES = 120 * 1024 * 1024

export function MediaProvider({ children }) {
  const defaults = useMemo(() => getDefaultMap(), [])
  const [urls, setUrls] = useState({})
  const [resolved, setResolved] = useState(defaults)
  const [ready, setReady] = useState(false)

  const applyPayload = useCallback(
    (data) => {
      setUrls(data.urls || {})
      setResolved({ ...defaults, ...(data.media || {}) })
      setReady(true)
    },
    [defaults],
  )

  const refresh = useCallback(async () => {
    const data = await api('/api/media')
    applyPayload(data)
  }, [applyPayload])

  useEffect(() => {
    refresh().catch((err) => {
      console.error(err)
      setResolved(defaults)
      setReady(true)
    })
  }, [refresh, defaults])

  const setUrl = useCallback(
    async (id, src) => {
      if (!(id in defaults)) throw new Error('Неизвестный слот медиа')
      const trimmed = String(src || '').trim()
      if (trimmed.startsWith('blob:')) {
        throw new Error(
          'Нельзя сохранить временный blob-URL. Загрузите файл или укажите обычный URL.',
        )
      }
      if (
        trimmed &&
        !(
          (trimmed.startsWith('/') && !trimmed.startsWith('//')) ||
          /^https?:\/\//i.test(trimmed)
        )
      ) {
        throw new Error(
          'Разрешены только http(s) URL или путь вида /placeholders/...',
        )
      }
      const data = await api(`/api/media/${encodeURIComponent(id)}/url`, {
        method: 'PUT',
        body: JSON.stringify({ url: trimmed }),
      })
      applyPayload(data)
    },
    [defaults, applyPayload],
  )

  const uploadFile = useCallback(
    async (id, file) => {
      if (!file) return
      if (!(id in defaults)) throw new Error('Неизвестный слот медиа')

      const slot = MEDIA_SLOTS.find((item) => item.id === id)
      const isVideo = slot?.kind === 'video'
      const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
      if (file.size > max) {
        throw new Error(
          isVideo
            ? 'Видео слишком большое (макс. 120 МБ)'
            : 'Изображение слишком большое (макс. 20 МБ)',
        )
      }
      if (
        isVideo &&
        !file.type.startsWith('video/') &&
        !/\.(mp4|webm|mov|m4v)$/i.test(file.name)
      ) {
        throw new Error('Нужен видеофайл')
      }
      if (
        !isVideo &&
        !file.type.startsWith('image/') &&
        !/\.(jpe?g|png|webp|gif|avif)$/i.test(file.name)
      ) {
        throw new Error('Нужен файл изображения')
      }

      const body = new FormData()
      body.append('file', file)
      const data = await api(`/api/media/${encodeURIComponent(id)}/file`, {
        method: 'POST',
        body,
      })
      applyPayload(data)
    },
    [defaults, applyPayload],
  )

  const resetSlot = useCallback(
    async (id) => {
      const data = await api(`/api/media/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      applyPayload(data)
    },
    [applyPayload],
  )

  const resetAll = useCallback(async () => {
    const data = await api('/api/media', { method: 'DELETE' })
    applyPayload(data)
  }, [applyPayload])

  const value = useMemo(
    () => ({
      ready,
      slots: MEDIA_SLOTS,
      media: resolved,
      urls,
      defaults,
      setUrl,
      uploadFile,
      resetSlot,
      resetAll,
      refresh,
    }),
    [
      ready,
      resolved,
      urls,
      defaults,
      setUrl,
      uploadFile,
      resetSlot,
      resetAll,
      refresh,
    ],
  )

  return <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
}

export function useMedia() {
  const ctx = useContext(MediaContext)
  if (!ctx) throw new Error('useMedia must be used within MediaProvider')
  return ctx
}
