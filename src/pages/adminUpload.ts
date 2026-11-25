import { api } from '../api'

/** Загрузить файл (фото или PDF) в /uploads; возвращает публичный адрес */
export async function uploadAdminFile(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const data = await api<{ url: string }>('/api/upload', { method: 'POST', body })
  return data.url
}

/** Понятный текст ошибки: 404 значит, что сервер запущен со старым кодом */
export function explainError(err: unknown, fallback: string): string {
  const message = String((err as Error | undefined)?.message || '')
  if (/\(404\)/.test(message)) {
    return 'Сервер работает на старой версии и не знает этого раздела. Перезапустите сайт: Ctrl + C и снова npm run dev.'
  }
  return message || fallback
}
