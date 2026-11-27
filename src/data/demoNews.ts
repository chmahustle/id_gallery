/**
 * Демо-события для показа заказчику: как выглядят журнал и страница события.
 * Попадают в базу один раз при VITE_DEMO_DATA=true (server/news.ts) и дальше
 * правятся или удаляются во вкладке «События» как обычные записи.
 * Тексты и фото — заглушки, имён нет.
 */
export type DemoNewsItem = {
  demo: true
  slug: string
  title: string
  date: string
  category: string
  excerpt: string
  image: string
  images: { src: string; caption: string }[]
  body: string[]
  ctaLabel?: string
  ctaHref?: string
}

const BODY = [
  'Первый абзац события: что происходит, где и когда. Два-три предложения, чтобы читатель сразу понял, стоит ли приходить.',
  'Второй абзац: что покажут гостям — коллекции, предметы, материалы. Здесь удобно назвать бренды и пространства шоурума.',
  'Третий абзац: для кого событие и как к нему подготовиться. Можно рассказать о формате встречи и о том, что будет после.',
  'Четвёртый абзац: как записаться и что взять с собой. Короткое завершение с приглашением.',
]

export const demoNews: DemoNewsItem[] = [
  {
    demo: true,
    slug: 'demo-prezentaciya-kollekcii',
    title: 'Презентация новой коллекции',
    date: '18.11.2026',
    category: 'Презентации',
    excerpt: 'Короткий анонс события: одна-две строки о том, что увидят гости.',
    image: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg',
    images: [
      { src: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg', caption: 'Подпись к фото' },
      { src: '/images/interior-01.png', caption: '' },
      { src: '/placeholders/product-02.jpg', caption: '' },
      { src: '/images/interior-03.png', caption: '' },
      { src: '/placeholders/product-10.jpg', caption: '' },
      { src: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg', caption: 'Подпись к фото' },
    ],
    body: BODY,
    ctaLabel: 'Записаться на встречу',
    ctaHref: '/request/?type=visit',
  },
  {
    demo: true,
    slug: 'demo-otkrytie-ekspozicii',
    title: 'Открытие экспозиции в шоуруме',
    date: '05.11.2026',
    category: 'Шоурумы',
    excerpt: 'Короткий анонс события: одна-две строки о том, что увидят гости.',
    image: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
    images: [
      { src: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg', caption: 'Подпись к фото' },
      { src: '/placeholders/product-10.jpg', caption: '' },
      { src: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg', caption: '' },
      { src: '/placeholders/product-02.jpg', caption: '' },
      { src: '/images/interior-01.png', caption: '' },
      { src: '/images/interior-03.png', caption: 'Подпись к фото' },
    ],
    body: BODY,
    ctaLabel: 'Записаться на встречу',
    ctaHref: '/request/?type=visit',
  },
  {
    demo: true,
    slug: 'demo-vstrecha-s-dizaynerami',
    title: 'Встреча для дизайнеров и архитекторов',
    date: '22.10.2026',
    category: 'Встречи',
    excerpt: 'Короткий анонс события: одна-две строки о том, что увидят гости.',
    image: '/images/interior-03.png',
    images: [
      { src: '/images/interior-03.png', caption: 'Подпись к фото' },
      { src: '/images/interior-02.png', caption: '' },
      { src: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg', caption: '' },
      { src: '/placeholders/product-10.jpg', caption: '' },
      { src: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg', caption: '' },
      { src: '/images/interior-01.png', caption: 'Подпись к фото' },
    ],
    body: BODY,
    ctaLabel: 'Записаться на встречу',
    ctaHref: '/request/?type=visit',
  },
]
