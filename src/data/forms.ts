/**
 * Метаданные полей форм заявок — docs/content-brief.md §18.
 * status: 'to-confirm' — поля добавлены для связи, ждут утверждения.
 */

export type FormFieldMeta = {
  id: string
  label: string
  status: 'approved' | 'placeholder' | 'to-confirm'
}

export const requestOfferFields: FormFieldMeta[] = [
  { id: 'name', label: 'Имя', status: 'approved' },
  { id: 'contact', label: 'Телефон или электронная почта', status: 'approved' },
  { id: 'model', label: 'Интересующая модель', status: 'approved' },
  { id: 'comment', label: 'Комментарий', status: 'approved' },
]

export const requestVisitFields: FormFieldMeta[] = [
  { id: 'name', label: 'Имя', status: 'to-confirm' },
  {
    id: 'contact',
    label: 'Телефон или электронная почта',
    status: 'to-confirm',
  },
  { id: 'date', label: 'Желаемая дата', status: 'approved' },
  { id: 'time', label: 'Желаемое время', status: 'approved' },
  { id: 'brandOrModel', label: 'Бренд или модель', status: 'approved' },
]
