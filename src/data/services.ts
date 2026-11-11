/**
 * Страница «Подбор и комплектация» (/services/podbor). Тексты и фото
 * временные: всё, что заглушка, помечено demo: true.
 */

export type ServiceStep = {
  num: string
  title: string
  text: string
  image: string
  demo: true
}

export const podbor = {
  slug: 'podbor',
  title: 'Подбор и комплектация',
  heroImage: '/images/Gemini_Generated_Image_sq76gsq76gsq76gs.jpg',
  intro: 'Текст вступления: чем мы помогаем клиенту.',
  primaryCta: 'Обсудить проект',
  secondaryCta: 'Встретиться в шоуруме',
  stepsTitle: 'Этапы работы',
  steps: [
    {
      num: '01',
      title: 'Знакомство с задачей',
      text: 'Текст этапа: что получает клиент.',
      image: '/images/interior-01.png',
      demo: true,
    },
    {
      num: '02',
      title: 'Подбор',
      text: 'Текст этапа: что получает клиент.',
      image: '/images/interior-03.png',
      demo: true,
    },
    {
      num: '03',
      title: 'Согласование',
      text: 'Текст этапа: что получает клиент.',
      image: '/images/partners.jpg',
      demo: true,
    },
    {
      num: '04',
      title: 'Комплектация',
      text: 'Текст этапа: что получает клиент.',
      image: '/images/hero.jpg',
      demo: true,
    },
  ] satisfies ServiceStep[],
  examplesTitle: 'Примеры',
  examplesLink: 'Все интерьеры',
  discussTitle: 'Обсудить проект',
  discussText: 'Расскажите о задаче, мы свяжемся с вами.',
  /** Тема заявки: форма на шаге 2, пока ссылка передаёт тему параметром */
  requestHref: '/request/?type=offer&topic=podbor',
  demo: true,
} as const
