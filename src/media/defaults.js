/** Слоты медиа — только public/placeholders (без RH) */

export const MEDIA_SLOTS = [
  {
    id: 'hero',
    label: 'Hero — главный баннер',
    kind: 'image',
    defaultSrc: '/images/Gemini_Generated_Image_sq76gsq76gsq76gs.jpg',
  },
  {
    id: 'outdoor',
    label: 'Второй баннер',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg',
  },
  {
    id: 'diningPoster',
    label: 'Постер 1',
    kind: 'image',
    defaultSrc: '/placeholders/product-02.jpg',
  },
  {
    id: 'diningDesktop',
    label: 'Видео 1 — desktop',
    kind: 'image',
    defaultSrc: '/placeholders/product-02.jpg',
  },
  {
    id: 'diningMobile',
    label: 'Видео 1 — mobile',
    kind: 'image',
    defaultSrc: '/placeholders/product-02.jpg',
  },
  {
    id: 'estates',
    label: 'Панель каталога',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
  },
  {
    id: 'modernPoster',
    label: 'Постер 2',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
  },
  {
    id: 'modernDesktop',
    label: 'Видео 2 — desktop',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
  },
  {
    id: 'modernMobile',
    label: 'Видео 2 — mobile',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
  },
  {
    id: 'modernBook',
    label: 'Панель коллекции',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
  },
  {
    id: 'interiorsPoster',
    label: 'Постер интерьеры',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
  },
  {
    id: 'interiorsDesktop',
    label: 'Видео 3 — desktop',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
  },
  {
    id: 'interiorsMobile',
    label: 'Видео 3 — mobile',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
  },
  {
    id: 'interiorsBook',
    label: 'Панель интерьеры',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
  },
  {
    id: 'membership',
    label: 'Дизайнерам',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
  },
  {
    id: 'sourcebooks',
    label: 'Каталоги',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_9eqvhh9eqvhh9eqv.jpg',
  },
  {
    id: 'exploreGallery',
    label: 'Блок салонов — 1',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_9wrdx89wrdx89wrd.jpg',
  },
  {
    id: 'exploreRestaurant',
    label: 'Блок салонов — 2',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_bts5zcbts5zcbts5.jpg',
  },
  {
    id: 'exploreGuesthouse',
    label: 'Блок салонов — 3',
    kind: 'image',
    defaultSrc: '/placeholders/Gemini_Generated_Image_ty7owqty7owqty7o.jpg',
  },
]

export function getDefaultMap() {
  return Object.fromEntries(MEDIA_SLOTS.map((slot) => [slot.id, slot.defaultSrc]))
}
