/** Заявка с сайта: тип, тема и поля формы поверх страницы */
export type RequestKind = 'offer' | 'visit' | 'project' | 'specialist'

export type RequestPayload = {
  kind: RequestKind
  /** Выбранный предмет, шоурум или тема: уже известны, повторно не вводятся */
  subject: string
  name: string
  contactMethod: string
  contact: string
  comment: string
  /** Для визита */
  date?: string
  time?: string
  /** Для специалиста */
  role?: string
  company?: string
  /** Адрес страницы, с которой отправлена заявка */
  page: string
  /** Получатель по типу заявки */
  recipient?: string
}

/** Кто получает заявку (по таблице маршрутизации); назначает ответственных сервер */
export const REQUEST_RECIPIENTS: Record<RequestKind, string> = {
  offer: 'Менеджер по продажам',
  project: 'Менеджер по комплектации',
  visit: 'Ответственный за посещения',
  specialist: 'Ответственный за партнёров',
}

export const REQUEST_ENDPOINT = '/api/requests'

/**
 * Отправка заявки. Успехом считается только ответ сервера 2xx: пока
 * приёма заявок на сервере нет, функция честно выбрасывает ошибку,
 * подтверждение «Заявка получена» не показывается.
 */
export async function submitRequest(payload: RequestPayload): Promise<void> {
  const response = await fetch(REQUEST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error(`Заявка не принята (${response.status})`)
  }
}
