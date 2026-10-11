/** Слоты медиа главной — значения по умолчанию */

export const MEDIA_SLOTS = [
  {
    id: 'hero',
    label: 'Hero — главный баннер',
    kind: 'image',
    defaultSrc: '/images/hero.jpg',
  },
  {
    id: 'outdoor',
    label: 'Outdoor / второй баннер',
    kind: 'image',
    defaultSrc: '/images/outdoor.jpg',
  },
  {
    id: 'diningPoster',
    label: 'Видео 1 — постер',
    kind: 'image',
    defaultSrc: '/images/dining.jpg',
  },
  {
    id: 'diningDesktop',
    label: 'Видео 1 — desktop',
    kind: 'video',
    defaultSrc:
      'https://embed-ssl.wistia.com/deliveries/87c8656a67c5885ac7121fcaca43b6be08f198c7.bin',
  },
  {
    id: 'diningMobile',
    label: 'Видео 1 — mobile',
    kind: 'video',
    defaultSrc:
      'https://embed-ssl.wistia.com/deliveries/3bfab15d81c49de9150d19840d38c0242e3636c8.bin',
  },
  {
    id: 'estates',
    label: 'Панель Estates',
    kind: 'image',
    defaultSrc: '/images/estates.jpg',
  },
  {
    id: 'modernPoster',
    label: 'Видео 2 — постер',
    kind: 'image',
    defaultSrc: '/images/modern.jpg',
  },
  {
    id: 'modernDesktop',
    label: 'Видео 2 — desktop',
    kind: 'video',
    defaultSrc:
      'https://embed-ssl.wistia.com/deliveries/4d6b51255d6d35984706effead4f1d155c3b700d.bin',
  },
  {
    id: 'modernMobile',
    label: 'Видео 2 — mobile',
    kind: 'video',
    defaultSrc:
      'https://embed-ssl.wistia.com/deliveries/da12b9fdfecdb9f4f1869017780fdf1f357ab1e6.bin',
  },
  {
    id: 'modernBook',
    label: 'Панель Modern',
    kind: 'image',
    defaultSrc: '/images/modern-book.jpg',
  },
  {
    id: 'interiorsPoster',
    label: 'Видео 3 — постер',
    kind: 'image',
    defaultSrc: '/images/interiors.jpg',
  },
  {
    id: 'interiorsDesktop',
    label: 'Видео 3 — desktop',
    kind: 'video',
    defaultSrc:
      'https://embed-ssl.wistia.com/deliveries/155ceb387664966ca6ef00ea3ac79939dd85310f.bin',
  },
  {
    id: 'interiorsMobile',
    label: 'Видео 3 — mobile',
    kind: 'video',
    defaultSrc:
      'https://embed-ssl.wistia.com/deliveries/da4dd3f86bf0969e05a9e9cc0e588d56440ee589.bin',
  },
  {
    id: 'interiorsBook',
    label: 'Панель Interiors',
    kind: 'image',
    defaultSrc: '/images/interiors-book.jpg',
  },
  {
    id: 'membership',
    label: 'Партнёрам / Membership',
    kind: 'image',
    defaultSrc: '/images/membership.jpg',
  },
  {
    id: 'sourcebooks',
    label: 'Каталоги / Sourcebooks',
    kind: 'image',
    defaultSrc: '/images/sourcebooks.jpg',
  },
  {
    id: 'exploreGallery',
    label: 'Блок салонов — 1',
    kind: 'image',
    defaultSrc: '/images/gallery.jpg',
  },
  {
    id: 'exploreRestaurant',
    label: 'Блок салонов — 2',
    kind: 'image',
    defaultSrc: '/images/restaurant.jpg',
  },
  {
    id: 'exploreGuesthouse',
    label: 'Блок салонов — 3',
    kind: 'image',
    defaultSrc: '/images/guesthouse.jpg',
  },
]

export function getDefaultMap() {
  return Object.fromEntries(MEDIA_SLOTS.map((slot) => [slot.id, slot.defaultSrc]))
}
