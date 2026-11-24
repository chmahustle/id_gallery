import type { Vacancy } from './career'

/** Демо-вакансии для показа заказчику: тексты-заглушки, demo: true */
export const demoVacancies: Vacancy[] = [
  {
    slug: 'vacancy-01',
    title: 'Название вакансии',
    place: 'Город',
    text: ['Текст: задачи и обязанности.', 'Текст: требования и условия.'],
    demo: true,
  },
  {
    slug: 'vacancy-02',
    title: 'Название вакансии',
    place: 'Город',
    text: ['Текст: задачи и обязанности.', 'Текст: требования и условия.'],
    demo: true,
  },
]
