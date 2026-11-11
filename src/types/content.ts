export type ContentStatus = 'approved' | 'placeholder'

/** Макро-кроп для фото-полосы BrandPage (этап 9d/9e) */
export type BrandDetailFocus = {
  /** Approved src кадра */
  src: string
  /** object-position X, 0–100 */
  x: number
  /** object-position Y, 0–100 (при вшитом тексте — в нижних 60%) */
  y: number
  /** scale 1.6–2.4 */
  zoom: number
}

/** Запись в необязательных списках бренда (интерфейс пока не выводится) */
export type BrandEntry = {
  title: string
  text?: string
  image?: string
  href?: string
}

/** Автор бренда (дизайнер). link позже будет вести на фильтр по автору. */
export type BrandAuthor = {
  name: string
  role: string
  /** Короткий абзац об авторе */
  bio?: string
  /** Необязательное фото; без него фото не показывается */
  photo?: string
  link: string
  demo?: boolean
}

/** Каталог/буклет бренда */
export type BrandCatalog = {
  title: string
  format: string
  /** Файл каталога; без него карточка не показывается */
  url: string
  /** Обложка 3:4; без неё — типографская плитка */
  cover?: string
  demo?: boolean
}

export type Brand = {
  slug: string
  name: string
  filter: string
  /** Краткий текст на /brands/ баннере */
  description: string
  /** Вводный абзац под H1 на /brands/<slug>/ — этап 9b */
  intro: string
  about: string
  catalogText: string
  collectionsLabel: string
  collectionsText: string
  collectionsCta: string
  requestText: string
  /** CTA на баннере /brands/ — «Смотреть Visionnaire» и т.п. */
  ctaLabel: string
  logo: string
  /** Полноэкранный баннер на /brands/ и hero на детальной */
  heroImage?: string
  /** Кадр в других местах (главная); между страницами дубли допустимы */
  image?: string
  /** Опциональная галерея — минимум 2 approved кадра помимо hero */
  gallery?: string[]
  /** Фокусы макро-кропов для фото-полосы (этап 9d) */
  detailFocus?: BrandDetailFocus[]
  website?: string
  /**
   * Порядок блоков на странице бренда:
   * характер бренда → подборка товаров → комнаты → коллекции → материалы →
   * авторы → каталоги. Поля ниже опциональны; пустые ничего не рендерят.
   */
  collections?: BrandEntry[]
  materials?: BrandEntry[]
  authors?: BrandAuthor[]
  catalogs?: BrandCatalog[]
  status: ContentStatus
}

export type Category = {
  slug: string
  label: string
  href: string
  /** Краткий текст под H1 / в карточке — docs/content-brief */
  description?: string
  /** CTA карточки категории; не выводить на страницах каталога без решения */
  ctaLabel?: string
  status: ContentStatus
  children?: string[]
}

export type ProductVariant = {
  id: string
  name: string
  swatch?: string
  image?: string
  status?: ContentStatus
}

/** Поле характеристик с явным статусом (этап 10). */
export type CharacteristicField = {
  value: string
  status: ContentStatus
}

export type ProductCharacteristics = {
  dimensions?: CharacteristicField
  materials?: CharacteristicField
  finishes?: CharacteristicField
  sku?: CharacteristicField
}

/** Кроп галереи товара (убрать вшитый текст бренда из кадра). */
export type ProductImageFocus = {
  x: number
  y: number
  zoom: number
}

/** Автор товара (дизайнер); позже появится фильтр каталога по автору */
export type ProductAuthor = {
  name: string
  slug: string
}

/** Документ товара: паспорт, инструкция и т.п. */
export type ProductDocument = {
  title: string
  url: string
  format: string
}

export type Product = {
  slug: string
  brand: string
  brandSlug: string
  name: string
  category: string
  categorySlug: string
  /** Краткое описание под заголовком (1–3 строки) */
  summary?: string
  /** Подробное описание для аккордеона (2–3 предложения) */
  shortDescription: string
  characteristics?: ProductCharacteristics
  images: string[]
  image: string
  /** Фокус кропа для главного / единственного кадра */
  imageFocus?: ProductImageFocus
  /** Фокусы по индексам images[] (если заданы) */
  imageFocuses?: ProductImageFocus[]
  variants?: ProductVariant[]
  /** @deprecated use variants */
  colors?: ProductVariant[]
  status: ContentStatus
  subcategory?: string
  /** Slug комнат; если не задано — выводится из категории */
  rooms?: string[]
  /** Коллекция; товары с одной коллекцией связаны блоком «Другие предметы коллекции» */
  collection?: string
  /** Автор; без него строка «Автор» не показывается */
  author?: ProductAuthor
  /** Документы; пустой список — блока нет */
  documents?: ProductDocument[]
  /** Текст по уходу; пустой — блока нет */
  care?: string
  /** Демонстрационный товар (src/data/demoProducts.ts, VITE_DEMO_DATA) */
  demo?: boolean
  popularity?: number
  createdAt?: string
}

export type FeatureFlags = {
  showNews: boolean
  showShowrooms: boolean
  showInteriors: boolean
  showProjects: boolean
  /** Подборки во «Вдохновении» — пока нет страницы */
  showSelections: boolean
  showCommerce: boolean
  showNewsletter: boolean
  /** «Карьера»: открывается после настройки получателя резюме */
  showCareer: boolean
  /** «Каталоги и материалы»: общая библиотека — по готовности */
  showMaterialsLibrary: boolean
  /** «Помощь после покупки» — по готовности содержания */
  showAftercare: boolean
  /** Коллекции/семейства на /brands/<slug>/ — только с подтверждёнными материалами */
  showBrandCollections: boolean
  /**
   * Плейсхолдеры описания/характеристик на карточке товара (этап 10c).
   * В production должно быть false; check:content падает при RELEASE=1 и true.
   */
  showProductPlaceholders: boolean
  /**
   * Демо-ряды шоурумов на /showrooms/ (этап 12).
   * В production должно быть false; check:content падает при RELEASE=1 и true.
   */
  showShowroomPlaceholders: boolean
  /**
   * Плейсхолдеры значений контактов на /contact/ (этап 14).
   * В production должно быть false; check:content падает при RELEASE=1 и true.
   */
  showContactPlaceholders: boolean
  /**
   * Форма «Написать нам» на /contact/ (этап 14).
   * В production должно быть false без утверждённого endpoint;
   * check:content падает при RELEASE=1 и true.
   */
  showContactForm: boolean
  /**
   * Страница /account/ (этап 17).
   * В production должно быть false без утверждённого сервиса авторизации;
   * check:content падает при RELEASE=1 и true.
   */
  showAccount: boolean
  /**
   * Формы /request/ (этап 18).
   * В production должно быть false без утверждённого приёма заявок;
   * check:content падает при RELEASE=1 и true.
   */
  showRequestForms: boolean
}

export type NavLink = {
  label: string
  href: string
  /** Скрыть ссылку, пока featureFlags[flag] !== true */
  flag?: keyof FeatureFlags
}

export type NavSubgroup = {
  title: string
  links: NavLink[]
}

export type NavSection = {
  title: string
  /** Если задан — заголовок колонки кликабелен */
  href?: string
  image?: string
  links: NavLink[]
  /** Подгруппы со своим подзаголовком, после основных ссылок */
  subgroups?: NavSubgroup[]
}

/** Контакты / legacy — docs/content-brief.md §09 */
export type Showroom = {
  city: string
  address: string
  status: ContentStatus
  mapSrc?: string
  mapLabel?: string
}

/** Карточка шоурума на /showrooms/ — docs/content-brief.md §12 */
export type ShowroomEntry = {
  slug: string
  name: string
  city: string
  address: string
  hours: string
  /** Телефон для звонка; шаблон «[Телефон]» — пока нет данных */
  phone?: string
  /** Адрес встраиваемой карты (iframe, Яндекс.Карты map-widget); без него — шаблон «[Карта]» */
  mapSrc?: string
  image: string
  imageFocus: ProductImageFocus
  status: ContentStatus
}

export type SiteContact = {
  label: string
  value: string
  href?: string
  status: ContentStatus
}

export type SiteContent = {
  name: string
  tagline: string
  description: string
  locale: string
  cta: {
    requestOffer: string
    bookVisit: string
    toCatalog: string
    allBrands: string
    priceOnRequest: string
  }
  legal: {
    privacyLabel: string
    privacyHref: string
    termsLabel?: string
    termsHref?: string
    /** true — юридические ссылки не показывать (тексты не утверждены) */
    hidden: boolean
  }
  contacts: SiteContact[]
  status: ContentStatus
}

/** Подборка интерьера — docs/content-brief.md §11 */
export type InteriorSelection = {
  slug: string
  title: string
  caption: string
  image: string
  imageFocus: ProductImageFocus
  /** slug товаров из data/products.ts */
  productIds: string[]
  /** Комната из data/rooms.ts, к которой относится интерьер */
  room?: string
  /** slug брендов, к которым относится интерьер (блок «Интерьеры» на странице бренда) */
  brands?: string[]
  /** Демонстрационный интерьер (src/data/demoInteriors.ts, VITE_DEMO_DATA) */
  demo?: boolean
  status: ContentStatus
}

export type ProductFilters = {
  category?: string
  brand?: string
  material?: string
  size?: string
  color?: string
}
