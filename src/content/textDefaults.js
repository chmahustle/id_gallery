import {
  catalogCategories as defaultCategories,
  contacts as defaultContacts,
  mainNav as defaultMainNav,
  site as defaultSite,
} from '../content.js'

/** Плоские текстовые слоты для админки */
export const TEXT_SLOTS = [
  { id: 'site.name', group: 'Сайт', label: 'Название сайта', defaultValue: defaultSite.name },
  {
    id: 'site.logoEyebrow',
    group: 'Сайт',
    label: 'Подпись над логотипом',
    defaultValue: 'The World of',
  },
  { id: 'site.locale', group: 'Сайт', label: 'Локаль / страна', defaultValue: defaultSite.locale },

  {
    id: 'contacts.address',
    group: 'Контакты',
    label: 'Город / адрес кратко',
    defaultValue: defaultContacts.address,
  },
  {
    id: 'contacts.phone',
    group: 'Контакты',
    label: 'Телефон',
    defaultValue: defaultContacts.phone,
  },
  {
    id: 'contacts.whatsapp',
    group: 'Контакты',
    label: 'WhatsApp (корзина и заявки)',
    defaultValue: '87024383624',
  },
  {
    id: 'contacts.email',
    group: 'Контакты',
    label: 'E-mail',
    defaultValue: defaultContacts.email,
  },
  {
    id: 'contacts.hours',
    group: 'Контакты',
    label: 'Часы работы',
    defaultValue: defaultContacts.hours,
  },

  {
    id: 'header.partners',
    group: 'Шапка',
    label: 'Ссылка справа (1)',
    defaultValue: 'Партнёрам',
  },
  {
    id: 'header.contacts',
    group: 'Шапка',
    label: 'Ссылка справа (2)',
    defaultValue: 'Контакты',
  },

  ...defaultMainNav.map((item, index) => ({
    id: `nav.${index}`,
    group: 'Меню (бургер)',
    label: `Пункт ${index + 1}`,
    defaultValue: item.label,
  })),

  ...defaultCategories.flatMap((cat, index) => [
    {
      id: `cat.${index}.label`,
      group: 'Категории',
      label: `Категория ${index + 1} — название`,
      defaultValue: cat.label,
    },
    {
      id: `cat.${index}.children`,
      group: 'Категории',
      label: `Категория ${index + 1} — подкатегории (с новой строки)`,
      defaultValue: (cat.children || []).join('\n'),
      multiline: true,
    },
    {
      id: `cat.${index}.brands`,
      group: 'Категории',
      label: `Категория ${index + 1} — бренды (с новой строки)`,
      defaultValue: (cat.brands || []).join('\n'),
      multiline: true,
    },
  ]),

  {
    id: 'hero.title',
    group: 'Блоки главной',
    label: 'Hero — заголовок (скрытый H1)',
    defaultValue: 'ID Gallery — интерьерный центр класса люкс',
  },
  {
    id: 'hero.alt',
    group: 'Блоки главной',
    label: 'Hero — alt изображения',
    defaultValue: 'Интерьер гостиной — новые коллекции ID Gallery',
  },
  {
    id: 'outdoor.title',
    group: 'Блоки главной',
    label: 'Outdoor — заголовок',
    defaultValue: 'Товары в наличии и outdoor-коллекции',
  },
  {
    id: 'outdoor.alt',
    group: 'Блоки главной',
    label: 'Outdoor — alt',
    defaultValue: 'Outdoor и товары в наличии — ID Gallery',
  },
  {
    id: 'estates.alt',
    group: 'Блоки главной',
    label: 'Estates — alt',
    defaultValue: 'Коллекция Estates — ID Gallery',
  },
  {
    id: 'modern.alt',
    group: 'Блоки главной',
    label: 'Modern — alt',
    defaultValue: 'Коллекция Modern — ID Gallery',
  },
  {
    id: 'interiors.alt',
    group: 'Блоки главной',
    label: 'Interiors — alt',
    defaultValue: 'Коллекция Interiors — ID Gallery',
  },
  {
    id: 'membership.title',
    group: 'Блоки главной',
    label: 'Партнёрам — заголовок',
    defaultValue: 'Партнёрам ID Gallery',
  },
  {
    id: 'membership.alt',
    group: 'Блоки главной',
    label: 'Партнёрам — alt',
    defaultValue: 'Партнёрам — архитекторы, дизайнеры, девелоперы',
  },
  {
    id: 'sourcebooks.title',
    group: 'Блоки главной',
    label: 'Каталоги — заголовок',
    defaultValue: 'Каталоги брендов',
  },
  {
    id: 'sourcebooks.alt',
    group: 'Блоки главной',
    label: 'Каталоги — alt',
    defaultValue: 'Каталоги и sourcebooks брендов ID Gallery',
  },
  {
    id: 'explore.0',
    group: 'Блоки главной',
    label: 'Нижний блок 1 — название',
    defaultValue: 'Флагманские салоны',
  },
  {
    id: 'explore.1',
    group: 'Блоки главной',
    label: 'Нижний блок 2 — название',
    defaultValue: 'Сервисы',
  },
  {
    id: 'explore.2',
    group: 'Блоки главной',
    label: 'Нижний блок 3 — название',
    defaultValue: 'Контакты',
  },

  {
    id: 'newsletter.title',
    group: 'Рассылка',
    label: 'Заголовок',
    defaultValue: 'Подписка на новости',
  },
  {
    id: 'newsletter.text',
    group: 'Рассылка',
    label: 'Описание',
    defaultValue: 'Анонсы новых коллекций, событий и обновлений шоурумов ID Gallery.',
    multiline: true,
  },
  {
    id: 'newsletter.placeholder',
    group: 'Рассылка',
    label: 'Placeholder e-mail',
    defaultValue: 'Ваш e-mail',
  },
  {
    id: 'newsletter.button',
    group: 'Рассылка',
    label: 'Кнопка',
    defaultValue: 'Подписаться',
  },
  {
    id: 'newsletter.thanks',
    group: 'Рассылка',
    label: 'Сообщение после подписки',
    defaultValue: 'Спасибо! Вы подписаны на рассылку.',
  },
]

export function getDefaultTextMap() {
  return Object.fromEntries(TEXT_SLOTS.map((slot) => [slot.id, slot.defaultValue]))
}

function lines(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

const MULTILINE_IDS = new Set(
  TEXT_SLOTS.filter((slot) => slot.multiline).map((slot) => slot.id),
)

/** Нормализация перед сохранением (trim + единый вид списков) */
export function normalizeTextValue(id, value) {
  const raw = String(value ?? '')
  if (MULTILINE_IDS.has(id)) return lines(raw).join('\n')
  return raw.trim()
}

function phoneHref(phone) {
  const digits = String(phone || '').replace(/[^\d+]/g, '')
  return digits ? `tel:${digits}` : '#'
}

function emailHref(email) {
  const value = String(email || '').trim()
  return value ? `mailto:${value}` : '#'
}

/** Собирает объекты для компонентов из плоской карты текстов */
export function buildContent(textMap) {
  const t = { ...getDefaultTextMap(), ...textMap }

  const site = {
    name: t['site.name'],
    logoEyebrow: t['site.logoEyebrow'],
    locale: t['site.locale'],
    tagline: defaultSite.tagline,
    description: defaultSite.description,
  }

  const contacts = {
    address: t['contacts.address'],
    addressDetail: defaultContacts.addressDetail,
    phone: t['contacts.phone'],
    phoneHref: phoneHref(t['contacts.phone']),
    whatsapp: t['contacts.whatsapp'] || '87024383624',
    email: t['contacts.email'],
    emailHref: emailHref(t['contacts.email']),
    hours: t['contacts.hours'],
  }

  const mainNav = defaultMainNav.map((item, index) => ({
    ...item,
    label: t[`nav.${index}`] ?? item.label,
  }))

  const catalogCategories = defaultCategories.map((cat, index) => {
    const label = t[`cat.${index}.label`] ?? cat.label
    const slug = cat.slug
    return {
      ...cat,
      label,
      slug,
      href: slug ? `/catalog/${slug}` : '/catalog',
      children: lines(t[`cat.${index}.children`]),
      brands: lines(t[`cat.${index}.brands`]),
    }
  })

  const header = {
    partners: t['header.partners'],
    contacts: t['header.contacts'],
  }

  const blocks = {
    heroTitle: t['hero.title'],
    heroAlt: t['hero.alt'],
    outdoorTitle: t['outdoor.title'],
    outdoorAlt: t['outdoor.alt'],
    estatesAlt: t['estates.alt'],
    modernAlt: t['modern.alt'],
    interiorsAlt: t['interiors.alt'],
    membershipTitle: t['membership.title'],
    membershipAlt: t['membership.alt'],
    sourcebooksTitle: t['sourcebooks.title'],
    sourcebooksAlt: t['sourcebooks.alt'],
  }

  const explore = [
    { title: t['explore.0'], href: '/brands' },
    { title: t['explore.1'], href: '#membership' },
    { title: t['explore.2'], href: '/contacts' },
  ]

  const newsletter = {
    title: t['newsletter.title'],
    text: t['newsletter.text'],
    placeholder: t['newsletter.placeholder'],
    button: t['newsletter.button'],
    thanks: t['newsletter.thanks'],
  }

  return {
    site,
    contacts,
    header,
    mainNav,
    catalogCategories,
    blocks,
    explore,
    newsletter,
  }
}
