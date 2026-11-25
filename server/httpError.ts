/** Ошибка с кодом ответа: обработчик ошибок отдаёт её текст клиенту (для 4xx) */
export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}
