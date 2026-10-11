/** Текстовое содержание и структура из docs.md (ТЗ ID Gallery). Без Битрикс/CRM. */

export const site = {
  name: 'ID Gallery',
  tagline: 'Интерьерный центр класса люкс',
  description:
    'Мебель, свет и декор ведущих фабрик — в готовых интерьерных зонах и флагманских шоурумах.',
  locale: 'Казахстан',
}

export const contacts = {
  address: 'Казахстан',
  addressDetail: 'Флагманские салоны в г. Астана и г. Алматы',
  phone: '+7 702 438 36 24',
  phoneHref: 'tel:+77024383624',
  email: 'info@id-gallery.kz',
  emailHref: 'mailto:info@id-gallery.kz',
  hours: 'Без выходных, с 10:00 до 21:00',
}

export const contactsPage = {
  title: 'Контакты',
  lead:
    'Запишитесь на персональную экскурсию, запросите коммерческое предложение или свяжитесь с нужным отделом.',
  showrooms: [
    {
      city: 'Астана',
      address: 'г. Астана — адрес флагманского салона уточняется',
      mapSrc:
        'https://yandex.ru/map-widget/v1/?ll=71.430429%2C51.128207&z=12&l=map',
      mapLabel: 'Карта: салон ID Gallery в Астане',
    },
    {
      city: 'Алматы',
      address: 'г. Алматы — адрес флагманского салона уточняется',
      mapSrc:
        'https://yandex.ru/map-widget/v1/?ll=76.945465%2C43.238293&z=12&l=map',
      mapLabel: 'Карта: салон ID Gallery в Алматы',
    },
  ],
  departments: [
    { label: 'Общие вопросы', email: 'info@id-gallery.kz' },
    { label: 'Коммерческие предложения', email: 'sales@id-gallery.kz' },
    { label: 'Партнёрам и архитекторам', email: 'partners@id-gallery.kz' },
  ],
  ctaTitle: 'Нужна консультация?',
  ctaText:
    'Напишите нам в WhatsApp — подберём решения под ваш проект и запишем на визит в салон.',
  ctaButton: 'Написать в WhatsApp',
}

/** Основные разделы сайта (меню) */
export const mainNav = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Бренды', href: '/brands' },
  { label: 'О компании', href: '/about' },
  { label: 'Новости', href: '/news' },
  { label: 'Сервисы', href: '#membership' },
  { label: 'Партнёрам', href: '/partners' },
  { label: 'Каталоги', href: '#sourcebooks' },
  { label: '3D-модели', href: '#modern' },
  { label: 'Контакты', href: '/contacts' },
]

/**
 * Категории каталога из ТЗ.
 * Во всплывающем меню: подкатегории (+ бренды, если указаны).
 */
export const furnitureSubcategories = [
  'Диваны',
  'Столы',
  'Кресла',
  'Барные стулья',
  'Шкафы',
]

export const catalogCategories = [
  {
    label: 'Мебель',
    slug: 'mebel',
    href: '/catalog/mebel',
    children: furnitureSubcategories,
    brands: ['Visionnaire', 'Giorgio Collection', 'Roberto Cavalli Home', 'Gamma Arredamenti'],
  },
  {
    label: 'Кровати',
    slug: 'krovati',
    href: '/catalog/krovati',
    children: ['Двуспальные', 'Односпальные', 'Изголовья', 'Прикроватные тумбы', 'Банкетки'],
    brands: ['Molteni&C', 'Ulivi Salotti'],
  },
  {
    label: 'Кухни',
    slug: 'kuhni',
    href: '/catalog/kuhni',
    children: ['Модульные кухни', 'Островные', 'Встроенная техника', 'Столешницы', 'Системы хранения'],
    brands: ['ARMANI/DADA', 'Molteni&C'],
  },
  {
    label: 'Свет',
    slug: 'svet',
    href: '/catalog/svet',
    children: ['Люстры', 'Торшеры', 'Бра', 'Настольные лампы', 'Технический свет'],
    brands: ['Visionnaire', 'DV Home Collection'],
  },
  {
    label: 'Декор и аксессуары',
    slug: 'dekor',
    href: '/catalog/dekor',
    children: ['Зеркала', 'Вазы и объекты', 'Текстиль', 'Ковры', 'Аксессуары для стола'],
    brands: ['Rugiano', 'Gianfranco Ferré Home'],
  },
]

export const productFilters = [
  'В наличии',
  'Под заказ',
  'Эксклюзив',
  'В пути',
]

export const promoSlides = [
  {
    id: 'sale',
    title: 'Новые коллекции в экспозиции',
    text: 'Диваны, кухни и свет ведущих фабрик — смотрите в шоурумах ID Gallery.',
    cta: 'В каталог',
    href: '/catalog',
    image: '/images/hero.jpg',
  },
  {
    id: 'tour',
    title: 'Персональная экскурсия',
    text: 'Запишитесь на визит: подберём решения под ваш проект.',
    cta: 'Записаться',
    href: '/contacts',
    image: '/images/dining.jpg',
  },
  {
    id: 'brands',
    title: 'Флагманские салоны брендов',
    text: 'Монобрендовые шоурумы и total look интерьерные зоны.',
    cta: 'Все бренды',
    href: '/brands',
    image: '/images/modern.jpg',
  },
  {
    id: 'stock',
    title: 'Товары в наличии',
    text: 'Выбирайте из наличия — быстрее комплектация проектов.',
    cta: 'Смотреть товары',
    href: `/catalog?status=${encodeURIComponent('В наличии')}`,
    image: '/images/interiors.jpg',
  },
]

export const aboutPage = {
  title: 'ID Gallery — интерьеры класса люкс в Казахстане.',
  lead:
    'Создаем интерьеры для тех, кто выбирает подлинные ценности, современную роскошь как образ жизни, коллекционный дизайн. Разрабатываем индивидуальные решения для тех, кто ценит время и эксклюзивное качество.',
  brandsIntro:
    'Представляем коллекцию легендарных брендов Италии, которые выбирают для наполнения интерьеров знаковых частных резиденций и общественных пространства по всему миру.',
  perks: [
    '20+ лет на рынке элитных интерьеров',
    'флагманские салоны в г. Астана и г. Алматы',
    '1500+ реализованных проектов',
    'комплектация под ключ',
    'консьерж-сервис: от концепции до реализации',
    'специальные условия и гибкая форма оплаты',
    'прямые поставки от 100+ итальянских фабрик без посредников',
    'гарантия сроков поставок',
  ],
  closing:
    'Лимитированные коллекции и новинки дизайнерской мебели, освещения и декора для частных резиденций и общественных пространств напрямую с фабрик без посредников с гарантией сроков доставки и первоклассного сервиса.',
  image: '/images/gallery.jpg',
  ctaBrands: 'Смотреть бренды',
  ctaCatalog: 'В каталог',
  ctaTour: 'Записаться на экскурсию',
}

export const about = {
  title: 'О компании',
  lead: aboutPage.lead,
  cta: 'Подробнее',
  href: '/about',
  image: aboutPage.image,
}

export const advantages = [
  {
    title: 'Флагманские шоурумы',
    text: 'Экспозиции ведущих мебельных брендов в формате готовых интерьерных зон.',
    href: '#showrooms',
  },
  {
    title: 'Товары в наличии и под заказ',
    text: 'Быстрый подбор из наличия и доступ к фабричным коллекциям под заказ.',
    href: '#products',
  },
  {
    title: 'Решения класса люкс',
    text: 'Мебель, свет и декор в единой концепции total look для жилых и коммерческих пространств.',
    href: '#catalog',
  },
  {
    title: 'Комплектация под ключ',
    text: 'Сопровождение проектов архитекторов, дизайнеров и девелоперов.',
    href: '#partners',
  },
]

export const showrooms = [
  {
    title: 'Гостиные и мягкая мебель',
    image: '/images/gallery.jpg',
  },
  {
    title: 'Кухни',
    image: '/images/restaurant.jpg',
  },
  {
    title: 'Спальни',
    image: '/images/guesthouse.jpg',
  },
]

/** Витрина брендов (страница /brands). filter — имя для фильтра каталога */
export const brandLogos = [
  {
    name: 'Visionnaire',
    filter: 'Visionnaire',
    logo: '/brand/logos/visionnaire.webp',
    website: 'https://www.visionnaire-home.com',
  },
  {
    name: 'Molteni&C',
    filter: 'Molteni&C',
    logo: null,
    website: 'https://www.molteni.it/',
  },
  {
    name: 'Baxter',
    filter: 'Baxter',
    logo: '/brand/logos/baxter.webp',
    website: 'https://www.baxter.it',
  },
  {
    name: 'Roberto Cavalli Home Interiors',
    filter: 'Roberto Cavalli Home',
    logo: '/brand/logos/roberto-cavalli.webp',
    website: 'https://robertocavallihomeinteriors.onirogroup.it',
  },
  {
    name: 'Gianfranco Ferré Home',
    filter: 'Gianfranco Ferré Home',
    logo: '/brand/logos/gianfranco-ferre.webp',
    website: 'https://gianfrancoferrehome.com',
  },
  {
    name: 'ETRO Home Interiors',
    filter: 'Etro',
    logo: '/brand/logos/etro.webp',
    website: 'https://www.etro.com/us-en/home-interiors-collection.html',
  },
  {
    name: 'Giorgio Collection',
    filter: 'Giorgio Collection',
    logo: '/brand/logos/giorgio-collection.webp',
    website: 'https://www.giorgiocollection.it',
  },
  {
    name: 'Bonaldo',
    filter: 'Bonaldo',
    logo: '/brand/logos/bonaldo.webp',
    website: 'https://www.bonaldo.com',
  },
  {
    name: 'Luceplan',
    filter: 'Luceplan',
    logo: '/brand/logos/luceplan.webp',
    website: 'https://www.luceplan.com',
  },
  {
    name: 'Venicem',
    filter: 'Venicem',
    logo: '/brand/logos/venicem.webp',
    website: 'https://www.venicem.com',
  },
  {
    name: 'Nemo',
    filter: 'Nemo',
    logo: '/brand/logos/nemo.webp',
    website: 'https://www.nemolighting.com',
  },
]

/** Имена брендов для главной / поиска */
export const brands = brandLogos.map((item) => item.name)

export const brandsPage = {
  eyebrow: 'ID Gallery',
  title: 'Idea Decor — интерьеры класса люкс в Казахстане.',
  lead:
    'Создаем интерьеры для тех, кто выбирает современную роскошь как образ жизни, и разрабатываем индивидуальные решения под ключ для тех, кто ценит время, эксклюзивное качество, коллекционный дизайн и подлинные ценности.',
  perks: [
    '20+ лет на рынке элитных интерьеров',
    'флагманские салоны в г. Астана и г. Алматы',
    '1500+ реализованных проектов',
    'комплектация под ключ',
    'консьерж-сервис: от концепции до реализации',
    'специальные условия и гибкая форма оплаты',
    'прямые поставки с фабрик из Италии без посредников',
    'гарантия сроков поставок',
  ],
  brandsIntro:
    'Представляем ведущие бренды Италии, за которыми стоят легендарные имена всемирно известных архитекторов и дизайнеров, создающих коллекции и отдельные предметы для современных и вневременных интерьеров.',
  officialSitesTitle: 'Официальные сайты брендов',
  limitedEyebrow: 'Лимитированные коллекции и новинки',
  limitedTitle: 'Дизайнерской мебели, освещения и декора',
  limitedText:
    'Столетиями высокий итальянский дизайн остается законодателем интерьерной моды и эталоном роскоши. Его выбирают за непревзойденное ремесленное мастерство ручной работы с редкими материалами, технологические инновации и бескомпромиссное качество — именно поэтому он становится частью знаковых частных резиденций и вилл, статусных яхт, общественных пространств роскошных отелей, клубов и штаб-квартир крупнейших корпораций.',
  image: '/images/estates.jpg',
  ctaCatalog: 'Смотреть каталог',
  ctaTour: 'Записаться на экскурсию',
}

export const products = [
  {
    slug: 'divan-tresor',
    sku: 'GC-TRS-01',
    name: 'Диван Tresor',
    brand: 'Giorgio Collection',
    category: 'Мебель',
    categorySlug: 'mebel',
    subcategory: 'Диваны',
    status: 'В наличии',
    price: 'по запросу',
    priceAmount: null,
    image: '/images/hero-sofa.jpg',
    images: ['/images/hero-sofa.jpg', '/images/hero.jpg', '/images/gallery.jpg'],
    description:
      'Модульный диван Tresor с мягкими объёмами и благородной обивкой — для гостиных total look.',
    specs: {
      Материалы: 'Ткань / кожа на выбор, каркас из массива',
      Размеры: '280 × 110 × 75 см',
      Цвета: 'Песок, графит, олива',
      Комплектация: '2 модуля + пуф',
    },
    pdfUrl: null,
    popularity: 96,
    createdAt: '2026-09-01',
  },
  {
    slug: 'divan-babylon-rack',
    sku: 'VN-BBR-12',
    name: 'Модульный диван Babylon Rack',
    brand: 'Visionnaire',
    category: 'Мебель',
    categorySlug: 'mebel',
    subcategory: 'Диваны',
    status: 'В наличии',
    price: '4 850 000 ₽',
    priceAmount: 4850000,
    image: '/images/dining.jpg',
    images: ['/images/dining.jpg', '/images/hero-a.jpg', '/images/interiors.jpg'],
    description:
      'Архитектурная модульная система Babylon Rack с металлическими акцентами и глубокой посадкой.',
    specs: {
      Материалы: 'Кожа, металл, массив',
      Размеры: '320 × 115 × 78 см',
      Цвета: 'Champagne, Nero',
      Комплектация: 'База + 2 боковых модуля',
    },
    pdfUrl: '/files/catalog-visionnaire.pdf',
    popularity: 94,
    createdAt: '2026-08-20',
  },
  {
    slug: 'stol-glasgow',
    sku: 'GF-GLS-08',
    name: 'Обеденный стол Glasgow',
    brand: 'Gianfranco Ferré Home',
    category: 'Мебель',
    categorySlug: 'mebel',
    subcategory: 'Столы',
    status: 'Под заказ',
    price: '1 920 000 ₽',
    priceAmount: 1920000,
    image: '/images/estates.jpg',
    images: ['/images/estates.jpg', '/images/restaurant.jpg', '/images/hero-d.jpg'],
    description: 'Обеденный стол Glasgow с выразительной столешницей и скульптурным основанием.',
    specs: {
      Материалы: 'Мрамор, металл',
      Размеры: '240 × 110 × 75 см',
      Цвета: 'Calacatta / латунь',
      Комплектация: 'Стол в сборе',
    },
    pdfUrl: null,
    popularity: 82,
    createdAt: '2026-07-12',
  },
  {
    slug: 'divan-madinari',
    sku: 'RC-MAD-03',
    name: 'Диван Madinari',
    brand: 'Roberto Cavalli Home',
    category: 'Мебель',
    categorySlug: 'mebel',
    subcategory: 'Диваны',
    status: 'В наличии',
    price: 'по запросу',
    priceAmount: null,
    image: '/images/membership.jpg',
    images: ['/images/membership.jpg', '/images/hero-lux.jpg', '/images/hero-b.jpg'],
    description: 'Диван Madinari с фирменным характером Cavalli — акцент гостиной и шоурума.',
    specs: {
      Материалы: 'Премиальная ткань, декоративная прострочка',
      Размеры: '260 × 105 × 80 см',
      Цвета: 'Ivory, Espresso',
      Комплектация: 'Диван + декоративные подушки',
    },
    pdfUrl: null,
    popularity: 88,
    createdAt: '2026-09-10',
  },
  {
    slug: 'kreslo-gamma-lounge',
    sku: 'GA-LNG-21',
    name: 'Кресло Gamma Lounge',
    brand: 'Gamma Arredamenti',
    category: 'Мебель',
    categorySlug: 'mebel',
    subcategory: 'Кресла',
    status: 'В пути',
    price: '890 000 ₽',
    priceAmount: 890000,
    image: '/images/hero-a.jpg',
    images: ['/images/hero-a.jpg', '/images/gallery.jpg', '/images/dining.jpg'],
    description: 'Комфортное кресло Lounge с обволакивающей посадкой и мягкими линиями.',
    specs: {
      Материалы: 'Кожа / ткань',
      Размеры: '95 × 90 × 85 см',
      Цвета: 'Cognac, Smoke',
      Комплектация: 'Кресло',
    },
    pdfUrl: null,
    popularity: 76,
    createdAt: '2026-06-28',
  },
  {
    slug: 'barnyy-stul-visionnaire',
    sku: 'VN-BRS-05',
    name: 'Барный стул Aura',
    brand: 'Visionnaire',
    category: 'Мебель',
    categorySlug: 'mebel',
    subcategory: 'Барные стулья',
    status: 'Под заказ',
    price: '420 000 ₽',
    priceAmount: 420000,
    image: '/images/restaurant.jpg',
    images: ['/images/restaurant.jpg', '/images/estates.jpg', '/images/hero-chand.jpg'],
    description: 'Барный стул Aura для кухонных островов и барных зон шоурума.',
    specs: {
      Материалы: 'Металл, кожа',
      Размеры: '45 × 50 × 95 см',
      Цвета: 'Bronze, Black',
      Комплектация: 'Стул',
    },
    pdfUrl: '/files/catalog-visionnaire.pdf',
    popularity: 70,
    createdAt: '2026-05-15',
  },
  {
    slug: 'shkaf-atelier',
    sku: 'GC-ATL-17',
    name: 'Шкаф Atelier',
    brand: 'Giorgio Collection',
    category: 'Мебель',
    categorySlug: 'mebel',
    subcategory: 'Шкафы',
    status: 'Эксклюзив',
    price: 'по запросу',
    priceAmount: null,
    image: '/images/modern.jpg',
    images: ['/images/modern.jpg', '/images/modern-book.jpg', '/images/interiors.jpg'],
    description: 'Система хранения Atelier с фасадами под шпон и скрытой фурнитурой.',
    specs: {
      Материалы: 'Шпон ореха, лак',
      Размеры: '300 × 65 × 260 см',
      Цвета: 'Walnut, Lacquer White',
      Комплектация: 'Корпус + внутренние модули',
    },
    pdfUrl: null,
    popularity: 73,
    createdAt: '2026-08-02',
  },
  {
    slug: 'krovat-twelve-am',
    sku: 'MC-TAM-02',
    name: 'Кровать Twelve A.M.',
    brand: 'Molteni&C',
    category: 'Кровати',
    categorySlug: 'krovati',
    subcategory: 'Двуспальные',
    status: 'В наличии',
    price: '2 450 000 ₽',
    priceAmount: 2450000,
    image: '/images/interiors.jpg',
    images: ['/images/interiors.jpg', '/images/interiors-book.jpg', '/images/guesthouse.jpg'],
    description: 'Кровать Twelve A.M. с мягким изголовьем и выверенными пропорциями спальни.',
    specs: {
      Материалы: 'Ткань, массив',
      Размеры: '180 × 200 см',
      Цвета: 'Taupe, Graphite',
      Комплектация: 'Каркас + изголовье',
    },
    pdfUrl: '/files/catalog-molteni.pdf',
    popularity: 91,
    createdAt: '2026-09-05',
  },
  {
    slug: 'krovat-ulivi-night',
    sku: 'UL-NGT-09',
    name: 'Кровать Ulivi Night',
    brand: 'Ulivi Salotti',
    category: 'Кровати',
    categorySlug: 'krovati',
    subcategory: 'Двуспальные',
    status: 'Под заказ',
    price: 'по запросу',
    priceAmount: null,
    image: '/images/guesthouse.jpg',
    images: ['/images/guesthouse.jpg', '/images/hero-b.jpg', '/images/membership.jpg'],
    description: 'Мягкая кровать Night с объёмным изголовьем и текстильной обивкой.',
    specs: {
      Материалы: 'Ткань, пенополиуретан',
      Размеры: '160 × 200 см',
      Цвета: 'Cream, Navy',
      Комплектация: 'Кровать + основание',
    },
    pdfUrl: null,
    popularity: 79,
    createdAt: '2026-07-22',
  },
  {
    slug: 'izgolove-molteni-soft',
    sku: 'MC-SFT-14',
    name: 'Изголовье Soft Panel',
    brand: 'Molteni&C',
    category: 'Кровати',
    categorySlug: 'krovati',
    subcategory: 'Изголовья',
    status: 'В наличии',
    price: '680 000 ₽',
    priceAmount: 680000,
    image: '/images/interiors-book.jpg',
    images: ['/images/interiors-book.jpg', '/images/interiors.jpg', '/images/hero-lux.jpg'],
    description: 'Мягкое изголовье Soft Panel для спален в спокойной палитре.',
    specs: {
      Материалы: 'Ткань, фанера',
      Размеры: '200 × 10 × 120 см',
      Цвета: 'Sand, Charcoal',
      Комплектация: 'Изголовье',
    },
    pdfUrl: '/files/catalog-molteni.pdf',
    popularity: 65,
    createdAt: '2026-04-18',
  },
  {
    slug: 'kuhnya-frame-blade',
    sku: 'AD-FRB-01',
    name: 'Кухня Frame Blade',
    brand: 'ARMANI/DADA',
    category: 'Кухни',
    categorySlug: 'kuhni',
    subcategory: 'Модульные кухни',
    status: 'Под заказ',
    price: 'по запросу',
    priceAmount: null,
    image: '/images/modern.jpg',
    images: ['/images/modern.jpg', '/images/modern-book.jpg', '/images/restaurant.jpg'],
    description:
      'Кухонная система Frame Blade — строгая геометрия и фирменная эстетика Armani/Dada.',
    specs: {
      Материалы: 'Шпон, лак, камень',
      Размеры: 'По проекту',
      Цвета: 'Grey Lacquer, Dark Oak',
      Комплектация: 'Модули + остров опционально',
    },
    pdfUrl: '/files/catalog-armani-dada.pdf',
    popularity: 93,
    createdAt: '2026-08-28',
  },
  {
    slug: 'kuhnya-molteni-ratio',
    sku: 'MC-RTO-06',
    name: 'Кухня Ratio',
    brand: 'Molteni&C',
    category: 'Кухни',
    categorySlug: 'kuhni',
    subcategory: 'Островные',
    status: 'В наличии',
    price: '7 200 000 ₽',
    priceAmount: 7200000,
    image: '/images/modern-book.jpg',
    images: ['/images/modern-book.jpg', '/images/modern.jpg', '/images/dining.jpg'],
    description: 'Островная кухня Ratio с интегрированной рабочей зоной и скрытым хранением.',
    specs: {
      Материалы: 'Шпон, нержавеющая сталь',
      Размеры: 'Остров 320 × 110 см',
      Цвета: 'Natural Oak',
      Комплектация: 'Остров + линейный блок',
    },
    pdfUrl: '/files/catalog-molteni.pdf',
    popularity: 87,
    createdAt: '2026-09-15',
  },
  {
    slug: 'torsher-gallery-floor',
    sku: 'VN-GFL-04',
    name: 'Торшер Gallery Floor',
    brand: 'Visionnaire',
    category: 'Свет',
    categorySlug: 'svet',
    subcategory: 'Торшеры',
    status: 'В наличии',
    price: '540 000 ₽',
    priceAmount: 540000,
    image: '/images/outdoor.jpg',
    images: ['/images/outdoor.jpg', '/images/hero-chand.jpg', '/images/estates.jpg'],
    description: 'Напольный светильник Gallery Floor с мягким рассеянным светом.',
    specs: {
      Материалы: 'Металл, стекло',
      Размеры: 'H 180 см',
      Цвета: 'Brass, Black',
      Комплектация: 'Торшер + абажур',
    },
    pdfUrl: '/files/catalog-visionnaire.pdf',
    popularity: 84,
    createdAt: '2026-07-30',
  },
  {
    slug: 'lyustra-dv-cascade',
    sku: 'DV-CSC-11',
    name: 'Люстра Cascade',
    brand: 'DV Home Collection',
    category: 'Свет',
    categorySlug: 'svet',
    subcategory: 'Люстры',
    status: 'Эксклюзив',
    price: 'по запросу',
    priceAmount: null,
    image: '/images/hero-chand.jpg',
    images: ['/images/hero-chand.jpg', '/images/hero-lux.jpg', '/images/gallery.jpg'],
    description: 'Люстра Cascade для высоких потолков и парадных зон.',
    specs: {
      Материалы: 'Хрусталь, металл',
      Размеры: 'Ø 90 × H 120 см',
      Цвета: 'Nickel, Clear',
      Комплектация: 'Люстра + крепёж',
    },
    pdfUrl: null,
    popularity: 80,
    createdAt: '2026-06-05',
  },
  {
    slug: 'bra-visionnaire-line',
    sku: 'VN-BRA-18',
    name: 'Бра Line Soft',
    brand: 'Visionnaire',
    category: 'Свет',
    categorySlug: 'svet',
    subcategory: 'Бра',
    status: 'В пути',
    price: '210 000 ₽',
    priceAmount: 210000,
    image: '/images/hero-d.jpg',
    images: ['/images/hero-d.jpg', '/images/outdoor.jpg', '/images/hero-chand.jpg'],
    description: 'Настенное бра Line Soft для спален и коридоров.',
    specs: {
      Материалы: 'Металл, ткань',
      Размеры: '25 × 12 × 35 см',
      Цвета: 'Champagne',
      Комплектация: 'Бра (пара опционально)',
    },
    pdfUrl: null,
    popularity: 62,
    createdAt: '2026-05-01',
  },
  {
    slug: 'dekor-object-collection',
    sku: 'DV-OBJ-07',
    name: 'Декор Object Collection',
    brand: 'DV Home Collection',
    category: 'Декор и аксессуары',
    categorySlug: 'dekor',
    subcategory: 'Вазы и объекты',
    status: 'Эксклюзив',
    price: 'по запросу',
    priceAmount: null,
    image: '/images/sourcebooks.jpg',
    images: ['/images/sourcebooks.jpg', '/images/gallery.jpg', '/images/hero-lux.jpg'],
    description: 'Коллекция декоративных объектов для завершения интерьерной композиции.',
    specs: {
      Материалы: 'Керамика, металл, стекло',
      Размеры: 'Набор 3 предмета',
      Цвета: 'Микс Neutral',
      Комплектация: 'Набор объектов',
    },
    pdfUrl: null,
    popularity: 74,
    createdAt: '2026-08-12',
  },
  {
    slug: 'zerkalo-rugiano-arc',
    sku: 'RG-ARC-15',
    name: 'Зеркало Arc',
    brand: 'Rugiano',
    category: 'Декор и аксессуары',
    categorySlug: 'dekor',
    subcategory: 'Зеркала',
    status: 'В наличии',
    price: '360 000 ₽',
    priceAmount: 360000,
    image: '/images/gallery.jpg',
    images: ['/images/gallery.jpg', '/images/hero-a.jpg', '/images/estates.jpg'],
    description: 'Зеркало Arc с тонкой металлической рамой — акцент прихожей или гостиной.',
    specs: {
      Материалы: 'Зеркало, латунь',
      Размеры: '120 × 4 × 180 см',
      Цвета: 'Brass',
      Комплектация: 'Зеркало + крепёж',
    },
    pdfUrl: null,
    popularity: 71,
    createdAt: '2026-09-08',
  },
  {
    slug: 'kovyor-ferre-silk',
    sku: 'GF-SLK-19',
    name: 'Ковёр Silk Geometry',
    brand: 'Gianfranco Ferré Home',
    category: 'Декор и аксессуары',
    categorySlug: 'dekor',
    subcategory: 'Ковры',
    status: 'Под заказ',
    price: '1 150 000 ₽',
    priceAmount: 1150000,
    image: '/images/hero-lux.jpg',
    images: ['/images/hero-lux.jpg', '/images/sourcebooks.jpg', '/images/interiors.jpg'],
    description: 'Ковёр Silk Geometry с геометрическим рисунком и шелковистой фактурой.',
    specs: {
      Материалы: 'Шёлк / шерсть',
      Размеры: '300 × 200 см',
      Цвета: 'Ivory Graphite',
      Комплектация: 'Ковёр',
    },
    pdfUrl: null,
    popularity: 68,
    createdAt: '2026-03-20',
  },
  {
    slug: 'tumba-molteni-side',
    sku: 'MC-SDE-22',
    name: 'Прикроватная тумба Side',
    brand: 'Molteni&C',
    category: 'Кровати',
    categorySlug: 'krovati',
    subcategory: 'Прикроватные тумбы',
    status: 'В наличии',
    price: '310 000 ₽',
    priceAmount: 310000,
    image: '/images/hero-b.jpg',
    images: ['/images/hero-b.jpg', '/images/guesthouse.jpg', '/images/interiors-book.jpg'],
    description: 'Компактная тумба Side для спальных зон Molteni&C.',
    specs: {
      Материалы: 'Шпон, металл',
      Размеры: '55 × 40 × 50 см',
      Цвета: 'Oak, Graphite',
      Комплектация: 'Тумба',
    },
    pdfUrl: null,
    popularity: 66,
    createdAt: '2026-09-18',
  },
  {
    slug: 'nastolnaya-lampa-dv',
    sku: 'DV-TBL-16',
    name: 'Настольная лампа Dome',
    brand: 'DV Home Collection',
    category: 'Свет',
    categorySlug: 'svet',
    subcategory: 'Настольные лампы',
    status: 'Ожидается новинка',
    price: '185 000 ₽',
    priceAmount: 185000,
    image: '/images/hero-rh.jpg',
    images: ['/images/hero-rh.jpg', '/images/hero-chand.jpg', '/images/outdoor.jpg'],
    description: 'Настольная лампа Dome для кабинетов и прикроватных зон.',
    specs: {
      Материалы: 'Металл, стекло',
      Размеры: 'H 55 см',
      Цвета: 'Nickel',
      Комплектация: 'Лампа',
    },
    pdfUrl: null,
    popularity: 58,
    createdAt: '2026-09-22',
  },
]

export const news = [
  {
    slug: 'obnovlenie-ekspozicii-myagkoj-mebeli',
    title: 'Обновление экспозиции мягкой мебели',
    date: '12.09.2026',
    category: 'Обновления шоурумов',
    excerpt:
      'В шоуруме появились новые модульные диваны и журнальные столы сезона.',
    image: '/images/gallery.jpg',
    images: [
      { src: '/images/gallery.jpg', caption: 'Новая зона мягкой мебели в шоуруме' },
      { src: '/images/hero-sofa.jpg', caption: 'Модульные диваны сезона' },
      { src: '/images/dining.jpg', caption: 'Журнальные столы и акценты' },
    ],
    body: [
      'В флагманских салонах ID Gallery обновили экспозицию мягкой мебели: модульные диваны, кресла и журнальные столы ведущих итальянских фабрик собраны в готовые гостиные зоны.',
      'Новые позиции можно посмотреть в наличии и обсудить комплектацию под проект — от ткани и кожи до габаритов и дополнительных модулей.',
      'Приглашаем архитекторов, дизайнеров и частных клиентов на персональный показ обновлённой экспозиции.',
    ],
    ctaLabel: 'Записаться на экскурсию',
    ctaHref: '/contacts',
    externalUrl: null,
    videoUrl: null,
  },
  {
    slug: 'predprokaz-kuhonnyh-kollekcij',
    title: 'Предпоказ кухонных коллекций',
    date: '28.08.2026',
    category: 'События',
    excerpt:
      'Новые кухни в материалах limited edition — запись на закрытый показ.',
    image: '/images/modern.jpg',
    images: [
      { src: '/images/modern.jpg', caption: 'Кухонная зона в экспозиции' },
      { src: '/images/modern-book.jpg', caption: 'Материалы и фасады limited edition' },
      { src: '/images/restaurant.jpg', caption: 'Островные решения для проектов' },
    ],
    body: [
      'Проводим закрытый предпоказ кухонных коллекций в материалах limited edition: редкие отделки, камни и шпоны, которые доступны в ограниченном тираже.',
      'На показе можно увидеть готовые компоновки, обсудить островные решения и сроки поставки напрямую с командой ID Gallery.',
      'Количество мест ограничено — запись через форму на странице контактов или WhatsApp.',
    ],
    ctaLabel: 'Записаться на показ',
    ctaHref: '/contacts',
    externalUrl: null,
    videoUrl: null,
  },
  {
    slug: 'dlya-arkhitektorov-i-dizajnerov',
    title: 'Для архитекторов и дизайнеров',
    date: '05.08.2026',
    category: 'Пресса',
    excerpt:
      'Расширили программу для партнёров: каталоги, 3D-модели и персональные туры.',
    image: '/images/membership.jpg',
    images: [
      { src: '/images/membership.jpg', caption: 'Программа для проектных бюро' },
      { src: '/images/sourcebooks.jpg', caption: 'Каталоги и материалы брендов' },
      { src: '/images/estates.jpg', caption: 'Персональные туры по шоурумам' },
    ],
    body: [
      'Для архитекторов и дизайнеров расширили партнёрскую программу: доступ к каталогам, 3D-моделям, приоритетной комплектации и персональным турам по салонам в Астане и Алматы.',
      'Формат удобен для частных резиденций и девелоперских проектов — от подбора до поставки и согласования сроков.',
      'Подробные условия — на странице «Партнёрам». Готовы обсудить сотрудничество индивидуально.',
    ],
    ctaLabel: 'Условия для партнёров',
    ctaHref: '/partners',
    externalUrl: null,
    videoUrl: null,
  },
  {
    slug: 'eksklyuzivy-sezona-v-salone',
    title: 'Эксклюзивы сезона в салоне',
    date: '18.07.2026',
    category: 'Эксклюзивы',
    excerpt:
      'Лимитированные предметы света и декора — в экспозиции флагманского салона.',
    image: '/images/hero-chand.jpg',
    images: [
      { src: '/images/hero-chand.jpg', caption: 'Люстры и акцентный свет' },
      { src: '/images/outdoor.jpg', caption: 'Напольные светильники' },
      { src: '/images/sourcebooks.jpg', caption: 'Декор и объекты коллекции' },
    ],
    body: [
      'В экспозиции появились лимитированные предметы света и декора: люстры, торшеры и объекты, которые редко держат на складе и привозят под запрос.',
      'Часть позиций уже доступна к просмотру в салоне — удобно показать клиенту total look до заказа основной мебели.',
    ],
    ctaLabel: 'Запросить КП',
    ctaHref: '/contacts',
    externalUrl: null,
    videoUrl: null,
  },
  {
    slug: 'novinki-sveta-luceplan-i-nemo',
    title: 'Новинки света Luceplan и Nemo',
    date: '02.07.2026',
    category: 'Обновления шоурумов',
    excerpt:
      'Обновили световую зону: новые модели для жилых и общественных пространств.',
    image: '/images/hero-lux.jpg',
    images: [
      { src: '/images/hero-lux.jpg', caption: 'Световая зона в шоуруме' },
      { src: '/images/hero-d.jpg', caption: 'Бра и локальный свет' },
      { src: '/images/hero-rh.jpg', caption: 'Настольные лампы' },
    ],
    body: [
      'Световая зона пополнилась новинками Luceplan и Nemo — от архитектурного света до декоративных акцентов для гостиных и кабинетов.',
      'Модели можно посмотреть вживую и подобрать под уже выбранную мебель Visionnaire, Baxter, Giorgio Collection и других брендов.',
    ],
    ctaLabel: 'Смотреть свет в каталоге',
    ctaHref: '/catalog/svet',
    externalUrl: 'https://www.luceplan.com',
    videoUrl: null,
  },
]

export const newsCategories = [
  'Все',
  'События',
  'Обновления шоурумов',
  'Эксклюзивы',
  'Пресса',
]

export function getNewsBySlug(slug, list = news) {
  return list.find((item) => item.slug === slug) || null
}

export function getAdjacentNews(slug, list = news) {
  const index = list.findIndex((item) => item.slug === slug)
  if (index < 0) return { prev: null, next: null }
  return {
    prev: index > 0 ? list[index - 1] : null,
    next: index < list.length - 1 ? list[index + 1] : null,
  }
}

export function newsPath(slug) {
  return `/news/${slug}`
}

export function toIsoDate(ruDate) {
  const [day, month, year] = String(ruDate || '').split('.')
  if (!day || !month || !year) return ''
  return `${year}-${month}-${day}`
}

export const services = [
  {
    title: 'Персональная экскурсия',
    text: 'Индивидуальный визит по шоурумам с подбором решений под задачу.',
  },
  {
    title: 'Коммерческое предложение',
    text: 'Подготовка КП по выбранным позициям и комплектациям.',
  },
  {
    title: 'Комплектация проектов',
    text: 'Сопровождение дизайнеров и девелоперов от подбора до поставки.',
  },
]

export const partnerTypes = [
  {
    title: 'Архитекторы и дизайнеры',
    text: 'Инструменты и сопровождение для проектной работы: от подбора до поставки на объект.',
    perks: [
      'Доступ к каталогам и 3D-моделям',
      'Персональные туры по шоурумам',
      'Приоритетная комплектация проектов',
      'Консультации по материалам и фабричным опциям',
    ],
    cta: 'Стать партнёром',
  },
  {
    title: 'Девелоперы',
    text: 'Комплектация жилых и коммерческих объектов под ключ с контролем сроков и качества.',
    perks: [
      'Комплектация объектов под ключ',
      'Эксклюзивные и лимитированные коллекции',
      'Согласование сроков поставки',
      'Единый подрядчик по мебели, свету и декору',
    ],
    cta: 'Обсудить проект',
  },
  {
    title: 'Дизайнеры интерьера',
    text: 'Поддержка частных и коммерческих проектов: быстрый доступ к наличию и фабричным коллекциям.',
    perks: [
      'Специальные условия сотрудничества',
      'Помощь в подборе total look решений',
      'Запись клиентов на персональные экскурсии',
      'Сопровождение до монтажа',
    ],
    cta: 'Оставить заявку',
  },
]

export const partnersPage = {
  title: 'Партнёрам',
  lead:
    'Сотрудничество для архитекторов, дизайнеров и девелоперов — каталоги, 3D-модели, персональные экскурсии и комплектация проектов под ключ.',
  typesTitle: 'С кем мы работаем',
  advantagesTitle: 'Преимущества сотрудничества',
  advantages: [
    'Прямые поставки с итальянских фабрик без посредников',
    'Флагманские салоны в Астане и Алматы для показов клиентам',
    'Консьерж-сервис: от концепции до реализации',
    'Гибкая форма оплаты и специальные условия для партнёров',
    'Гарантия сроков поставок и сопровождение проекта',
    'Доступ к лимитированным коллекциям и новинкам',
  ],
  advantagesCta: 'Стать партнёром',
  brandsTitle: 'Бренды для ваших проектов',
  brandsLead: 'Легендарные итальянские фабрики — в одном партнёрском контуре ID Gallery.',
  newsTitle: 'Новости для партнёров',
  newsLead: 'Обновления экспозиций, закрытые показы и материалы для проектной работы.',
  ctaTitle: 'Готовы обсудить сотрудничество?',
  ctaText:
    'Оставьте заявку — расскажем об условиях, организуем тур по шоуруму и подберём формат работы под ваш офис или девелоперский проект.',
  ctaButton: 'Связаться с нами',
  image: '/images/membership.jpg',
}

/** Индекс для поиска по сайту */
export const searchIndex = [
  ...mainNav.map((item) => ({
    title: item.label,
    type: 'Раздел',
    href: item.href,
    keywords: item.label,
  })),
  ...catalogCategories.flatMap((cat) => [
    {
      title: cat.label,
      type: 'Категория',
      href: cat.href,
      keywords: [cat.label, ...(cat.children || [])].join(' '),
    },
    ...(cat.children || []).map((child) => ({
      title: child,
      type: 'Подкатегория',
      href: `${cat.href}?sub=${encodeURIComponent(child)}`,
      keywords: `${child} ${cat.label}`,
    })),
  ]),
  {
    title: 'Бренды',
    type: 'Раздел',
    href: '/brands',
    keywords: 'бренды italy италия visionnaire baxter idea decor',
  },
  {
    title: 'О компании',
    type: 'Раздел',
    href: '/about',
    keywords: 'о компании id gallery idea decor казахстан астана алматы',
  },
  {
    title: 'Партнёрам',
    type: 'Раздел',
    href: '/partners',
    keywords: 'партнёрам архитекторы дизайнеры девелоперы сотрудничество',
  },
  ...brandLogos.map((item) => ({
    title: item.name,
    type: 'Бренд',
    href: `/catalog?brand=${encodeURIComponent(item.filter)}`,
    keywords: `${item.name} ${item.filter}`,
  })),
  ...products.map((item) => ({
    title: item.name,
    type: 'Товар',
    href: `/product/${item.slug}`,
    keywords: [item.name, item.brand, item.category, item.subcategory, item.status, item.sku]
      .filter(Boolean)
      .join(' '),
    meta: item.brand,
  })),
  {
    title: 'Новости',
    type: 'Раздел',
    href: '/news',
    keywords: 'новости события шоурум экспозиция',
  },
  ...news.map((item) => ({
    title: item.title,
    type: 'Новость',
    href: `/news/${item.slug}`,
    keywords: `${item.title} ${item.excerpt} ${item.category || ''}`,
    meta: item.date,
  })),
  ...services.map((item) => ({
    title: item.title,
    type: 'Сервис',
    href: '#membership',
    keywords: `${item.title} ${item.text}`,
  })),
  {
    title: 'Контакты',
    type: 'Раздел',
    href: '/contacts',
    keywords: `контакты экскурсия телефон email астана алматы ${contacts.phone} ${contacts.email} ${contacts.address}`,
  },
]

/** Индекс поиска с учётом отредактированных текстов (навигация / категории / контакты) */
export function buildSearchIndex(content, newsList, brandsList) {
  if (!content && !newsList && !brandsList) return searchIndex

  const { mainNav: nav, catalogCategories: cats, contacts: c } = content || {
    mainNav: [],
    catalogCategories: [],
    contacts: {},
  }
  const dynamicBrands = new Set()
  const liveNews = Array.isArray(newsList) ? newsList : null
  const liveBrands = Array.isArray(brandsList) ? brandsList : null

  const dynamic = [
    ...nav
      .filter((item) => item.label?.trim())
      .map((item) => ({
        title: item.label,
        type: 'Раздел',
        href: item.href,
        keywords: item.label,
      })),
    ...cats.flatMap((cat) => {
      const label = cat.label?.trim()
      const children = (cat.children || []).filter(Boolean)
      const brands = (cat.brands || []).filter(Boolean)
      brands.forEach((brand) => dynamicBrands.add(brand))
      const brandEntries = liveBrands
        ? []
        : brands.map((brand) => ({
            title: brand,
            type: 'Бренд',
            href: cat.slug
              ? `/catalog/${cat.slug}?brand=${encodeURIComponent(brand)}`
              : `/catalog?brand=${encodeURIComponent(brand)}`,
            keywords: `${brand} ${label || ''}`.trim(),
          }))
      return [
        label
          ? {
              title: label,
              type: 'Категория',
              href: cat.href,
              keywords: [label, ...children, ...brands].join(' '),
            }
          : null,
        ...children.map((child) => ({
          title: child,
          type: 'Подкатегория',
          href: `${cat.href}?sub=${encodeURIComponent(child)}`,
          keywords: `${child} ${label || ''}`.trim(),
        })),
        ...brandEntries,
      ].filter(Boolean)
    }),
    {
      title: 'Контакты',
      type: 'Раздел',
      href: '/contacts',
      keywords: `контакты экскурсия телефон email астана алматы ${c.phone} ${c.email} ${c.address}`,
    },
  ]

  const staticPart = searchIndex.filter((item) => {
    if (item.type === 'Бренд') {
      if (liveBrands) return false
      return !dynamicBrands.has(item.title)
    }
    if (item.type === 'Новость') return !liveNews
    return item.type === 'Товар' || item.type === 'Сервис'
  })

  const newsPart = liveNews
    ? liveNews.map((item) => ({
        title: item.title,
        type: 'Новость',
        href: `/news/${item.slug}`,
        keywords: `${item.title} ${item.excerpt || ''} ${item.category || ''}`,
        meta: item.date,
      }))
    : []

  const brandsPart = liveBrands
    ? liveBrands.map((item) => ({
        title: item.name,
        type: 'Бренд',
        href: `/catalog?brand=${encodeURIComponent(item.filter || item.name)}`,
        keywords: `${item.name} ${item.filter || ''}`,
      }))
    : []

  return [...dynamic, ...staticPart, ...newsPart, ...brandsPart]
}

export function searchSite(query, limit = 12, content, newsList, brandsList) {
  const q = query.trim().toLowerCase().replace(/ё/g, 'е')
  if (q.length < 2) return []

  const index = buildSearchIndex(content, newsList, brandsList)

  const scored = index
    .map((item) => {
      const hay = `${item.title} ${item.keywords} ${item.type} ${item.meta || ''}`
        .toLowerCase()
        .replace(/ё/g, 'е')
      if (!hay.includes(q)) return null
      const titleHit = item.title.toLowerCase().replace(/ё/g, 'е').includes(q)
      return { ...item, score: titleHit ? 2 : 1 }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'ru'))

  return scored.slice(0, limit)
}

export const footerColumns = [
  {
    title: 'Разделы',
    links: mainNav,
  },
  {
    title: 'Каталог',
    links: catalogCategories.map(({ label, href }) => ({ label, href })),
  },
  {
    title: 'Сервис',
    links: [
      { label: 'Запись на экскурсию', href: '/contacts' },
      { label: 'Запросить КП', href: '/contacts' },
      { label: 'Каталоги брендов', href: '#sourcebooks' },
      { label: 'Партнёрам', href: '/partners' },
    ],
  },
  {
    title: 'Правовая информация',
    links: [{ label: 'Политика конфиденциальности', href: '/contacts' }],
  },
]
