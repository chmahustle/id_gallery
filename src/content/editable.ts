import { aboutApproach, aboutCopy, aboutListHero } from '../data/about'
import { brands, brandsPage } from '../data/brands'
import { catalogCopy } from '../data/categories'
import { materialsCopy } from '../data/materials'
import { consultationCopy, serviceDirections } from '../data/request-page'
import { roomsCopy } from '../data/rooms'
import { showroomsCopy, showroomsListHero, showroomsVisitBanner } from '../data/showrooms'
import { seoPages } from '../data/seo'
import { careerCopy, careerFormImage, careerHero, careerWhy } from '../data/career'
import { contactAsideImage, contactListHero, contactPageCopy } from '../data/contact-page'
import {
  homeBannerImages,
  homeHero,
  homeHeroSlides,
  homeSections,
} from '../data/home'
import { interiors, interiorsCopy, interiorsListHero } from '../data/interiors'
import { podbor } from '../data/services'
import {
  tradeCards,
  tradeCopy,
  tradeCoopBanner,
  tradeDesigners,
  tradeDevelopers,
  tradeIntroBlock,
  tradeListHero,
} from '../data/trade'

/**
 * Реестр полей, которые можно менять в админке («Тексты и фото»).
 * Каждое поле указывает на строку в данных страницы; правка из базы
 * (таблица content_overrides) подменяет её до первой отрисовки сайта.
 * Чтобы сделать поле редактируемым — добавьте строку сюда.
 */

/** link — кнопка: текст и ссылка вместе (значение — JSON {label, href}) */
export type EditableKind = 'text' | 'textarea' | 'image' | 'link'

export type EditableField = {
  id: string
  group: string
  label: string
  kind: EditableKind
  /** Значение из кода — к нему возвращает «Сбросить» */
  defaultValue: string
  /** Блок страницы, где стоит поле (главная, услуги) — поиск только в нём */
  block?: string
  /** Поле бренда: хранится в карточке бренда (вкладка «Бренды»), а не в правках текстов */
  brand?: { slug: string; key: string }
  /** Для поисковиков: заголовок вкладки и описание страницы */
  seo?: boolean
  /** Кнопки и подписи: второстепенные тексты страницы, свой список в конструкторе */
  extra?: boolean
  /** Текущее значение на сайте (с учётом правок) */
  get: () => string
  apply: (value: string) => void
}

type Target = Record<string, unknown>

const fields: EditableField[] = []

function srcSetFor(url: string) {
  return `${url} 1280w, ${url} 1920w, ${url} 2560w`
}

/** Блок поля по его id: главная и услуги собраны из блоков с известными именами */
function blockFor(id: string): string | undefined {
  const home = id.match(/^home\.(hero|featured|brands|interiors|partners|showrooms)\./)
  if (home) return home[1]
  if (/^services\.hero\./.test(id)) return 'hero'
  if (/^services\.(about|direction\d+)\./.test(id)) return 'about'
  if (/^services\.(steps|step\d+)\./.test(id)) return 'steps'
  if (/^services\.(result|next)\./.test(id)) return 'next'
  if (/^services\.interiors\./.test(id)) return 'interiors'
  /* страница каталога правится формой: «Страница» и «Типы» */
  if (/^catalog\.page\./.test(id)) return 'page'
  return undefined
}

/** Поле obj[key]; вид определяется по имени ключа и длине текста */
function add(
  group: string,
  id: string,
  label: string,
  obj: unknown,
  key: string,
  brand?: { slug: string; key: string },
) {
  const target = obj as Target
  const current = target?.[key]
  if (typeof current !== 'string') return
  const kind: EditableKind = /image|src/i.test(key)
    ? 'image'
    : current.length > 80
      ? 'textarea'
      : 'text'
  fields.push({
    id,
    group,
    label,
    kind,
    defaultValue: current,
    block: blockFor(id),
    brand,
    get: () => String(target[key] ?? ''),
    apply(value) {
      target[key] = value
      /* у баннеров рядом лежит srcSet — он должен указывать на новый файл */
      if (kind === 'image' && typeof target.srcSet === 'string') {
        target.srcSet = srcSetFor(value)
      }
    },
  })
}

/* —— Главная —— */
{
  const g = 'Главная'
  add(g, 'home.hero.image', 'Первый экран — фото', homeHeroSlides[0], 'image')
  add(g, 'home.hero.title', 'Первый экран — заголовок', homeHero, 'title')
  add(g, 'home.hero.subtitle', 'Первый экран — подзаголовок', homeHero, 'subtitle')
  add(g, 'home.featured.title', 'По комнатам — заголовок', homeSections.featured, 'title')
  add(g, 'home.featured.text', 'По комнатам — текст', homeSections.featured, 'description')
  add(g, 'home.brands.title', 'Бренды — заголовок', homeSections.brands, 'title')
  add(g, 'home.brands.image', 'Бренды — фото баннера', homeBannerImages.brands, 'src')
  add(g, 'home.interiors.title', 'Интерьеры — заголовок', homeSections.interiors, 'title')
  add(g, 'home.interiors.text', 'Интерьеры — текст', homeSections.interiors, 'description')
  add(g, 'home.interiors.image', 'Интерьеры — фото баннера', homeBannerImages.interiors, 'src')
  add(g, 'home.partners.title', 'Подбор и комплектация — заголовок', homeSections.partners, 'title')
  add(g, 'home.partners.image', 'Подбор и комплектация — фото', homeBannerImages.partners, 'src')
  add(g, 'home.showrooms.title', 'Шоурумы — заголовок', homeSections.showrooms, 'title')
  add(g, 'home.showrooms.text', 'Шоурумы — текст', homeSections.showrooms, 'description')
  add(g, 'home.showrooms.image', 'Шоурумы — фото баннера', homeBannerImages.showrooms, 'src')
}

/* —— Услуги: Подбор и комплектация —— */
{
  const g = 'Услуги'
  add(g, 'services.hero.image', 'Первый экран — фото', podbor, 'heroImage')
  add(g, 'services.hero.title', 'Первый экран — заголовок', podbor, 'title')
  add(g, 'services.hero.intro', 'Первый экран — подзаголовок', podbor, 'intro')
  add(g, 'services.about.title', 'Направления — заголовок', podbor, 'aboutTitle')
  add(g, 'services.about.text', 'Направления — текст', podbor, 'aboutText')
  podbor.directions.forEach((item, i) => {
    const n = i + 1
    add(g, `services.direction${n}.title`, `Направление ${n} — заголовок`, item, 'title')
    add(g, `services.direction${n}.text`, `Направление ${n} — текст`, item, 'text')
    add(g, `services.direction${n}.image`, `Направление ${n} — фото`, item, 'image')
  })
  add(g, 'services.steps.title', 'Как мы работаем — заголовок', podbor, 'stepsTitle')
  podbor.steps.forEach((item, i) => {
    const n = i + 1
    add(g, `services.step${n}.title`, `Этап ${n} — заголовок`, item, 'title')
    add(g, `services.step${n}.text`, `Этап ${n} — текст`, item, 'text')
    add(g, `services.step${n}.image`, `Этап ${n} — фото`, item, 'image')
  })
  add(g, 'services.result.title', 'Что вы получаете — заголовок', podbor, 'resultTitle')
  add(g, 'services.result.text', 'Что вы получаете — текст', podbor, 'resultText')
  add(g, 'services.next.title', 'Следующий шаг — заголовок', podbor, 'nextTitle')
  add(g, 'services.next.text', 'Следующий шаг — текст', podbor, 'nextText')
  add(g, 'services.interiors.title', 'Интерьеры — заголовок', podbor, 'interiorsTitle')
  add(g, 'services.interiors.text', 'Интерьеры — текст', podbor, 'interiorsText')
  add(g, 'services.interiors.image', 'Интерьеры — фото', podbor, 'interiorsImage')
}

/* —— Бренды —— */
for (const brand of brands) {
  const g = `Бренд ${brand.name}`
  const b = brand as unknown as Target
  const at = (key: string) => ({ slug: brand.slug, key })
  add(g, `brand.${brand.slug}.hero`, 'Первый экран — фото', b, 'heroImage', at('heroImage'))
  add(g, `brand.${brand.slug}.intro`, 'Первый экран — подзаголовок', b, 'intro', at('intro'))
  add(g, `brand.${brand.slug}.about`, 'О бренде — текст', b, 'about', at('about'))
  add(g, `brand.${brand.slug}.description`, 'Описание в списке брендов', b, 'description', at('description'))
}

/* —— Интерьеры —— */
{
  const g = 'Интерьеры'
  add(g, 'interiors.hero.image', 'Первый экран — фото', interiorsListHero, 'image')
  add(g, 'interiors.hero.title', 'Первый экран — заголовок', interiorsCopy, 'listHeroTitle')
  add(g, 'interiors.hero.lead', 'Первый экран — подзаголовок', interiorsCopy, 'listHeroLead')
  add(g, 'interiors.intro.text', 'Вступление — текст', interiorsCopy, 'introText')
  /* интерьеры списка: заголовок, подпись и фото каждого */
  interiors.forEach((item) => {
    const label = `Интерьер «${item.title}»`
    add(g, `interior.${item.slug}.title`, `${label} — заголовок`, item, 'title')
    add(g, `interior.${item.slug}.caption`, `${label} — текст`, item, 'caption')
    add(g, `interior.${item.slug}.image`, `${label} — фото`, item, 'image')
  })
}

/* —— Профессионалам —— */
{
  const g = 'Профессионалам'
  add(g, 'trade.hero.image', 'Первый экран — фото', tradeListHero, 'image')
  add(g, 'trade.hero.title', 'Первый экран — заголовок', tradeCopy, 'heroTitle')
  add(g, 'trade.hero.intro', 'Первый экран — подзаголовок', tradeCopy, 'intro')
  add(g, 'trade.intro.text', 'Вступление — текст', tradeIntroBlock, 'text')
  add(g, 'trade.designers.title', 'Дизайнерам и архитекторам — заголовок', tradeDesigners, 'title')
  tradeCards.forEach((card, i) => {
    const n = i + 1
    add(g, `trade.card${n}.title`, `Дизайнерам, карточка ${n} — заголовок`, card, 'title')
    add(g, `trade.card${n}.text`, `Дизайнерам, карточка ${n} — текст`, card, 'text')
    add(g, `trade.card${n}.image`, `Дизайнерам, карточка ${n} — фото`, card, 'image')
  })
  add(g, 'trade.developers.title', 'Девелоперам — заголовок', tradeDevelopers, 'title')
  tradeDevelopers.cards.forEach((card, i) => {
    const n = i + 1
    add(g, `trade.dev${n}.title`, `Девелоперам, карточка ${n} — заголовок`, card, 'title')
    add(g, `trade.dev${n}.text`, `Девелоперам, карточка ${n} — текст`, card, 'text')
    add(g, `trade.dev${n}.image`, `Девелоперам, карточка ${n} — фото`, card, 'image')
  })
  add(g, 'trade.coop.title', 'Сотрудничество — заголовок', tradeCopy, 'coopTitle')
  add(g, 'trade.coop.text', 'Сотрудничество — текст', tradeCopy, 'coopLead')
  add(g, 'trade.coop.image', 'Сотрудничество — фото', tradeCoopBanner, 'image')
}

/* —— О галерее —— */
{
  const g = 'О галерее'
  add(g, 'about.hero.image', 'Первый экран — фото', aboutListHero, 'image')
  add(g, 'about.hero.title', 'Первый экран — заголовок', aboutCopy, 'heroTitle')
  add(g, 'about.hero.lead', 'Первый экран — подзаголовок', aboutCopy, 'heroLead')
  add(g, 'about.approach.text', 'Наш подход — текст', aboutCopy, 'approachText')
  add(g, 'about.approach.image', 'Наш подход — фото', aboutApproach, 'image')
}

/* —— Контакты —— */
{
  const g = 'Контакты'
  add(g, 'contact.hero.image', 'Первый экран — фото', contactListHero, 'image')
  add(g, 'contact.hero.title', 'Первый экран — заголовок', contactPageCopy, 'heroTitle')
  add(g, 'contact.hero.lead', 'Первый экран — подзаголовок', contactPageCopy, 'heroLead')
  add(g, 'contact.form.lead', 'Форма — текст', contactPageCopy, 'formLead')
  add(g, 'contact.aside.image', 'Фото рядом с контактами', contactAsideImage, 'image')
}

/* —— Карьера —— */
{
  const g = 'Карьера'
  add(g, 'career.hero.image', 'Первый экран — фото', careerHero, 'image')
  add(g, 'career.hero.title', 'Первый экран — заголовок', careerCopy, 'title')
  add(g, 'career.hero.lead', 'Первый экран — подзаголовок', careerCopy, 'lead')
  add(g, 'career.why.title', 'Работа в ID Gallery — заголовок', careerCopy, 'whyTitle')
  careerWhy.forEach((item, i) => {
    const n = i + 1
    add(g, `career.why${n}.title`, `Карточка ${n} — заголовок`, item, 'title')
    add(g, `career.why${n}.text`, `Карточка ${n} — текст`, item, 'text')
    add(g, `career.why${n}.image`, `Карточка ${n} — фото`, item, 'image')
  })
  add(g, 'career.form.lead', 'Отклик — текст', careerCopy, 'formLead')
  add(g, 'career.form.image', 'Отклик — фото', careerFormImage, 'image')
}

/* —— Шоурумы: тексты и фото страницы (сами шоурумы — «Контакты и шоурумы») —— */
{
  const g = 'Шоурумы'
  const copy = showroomsCopy as unknown as Target
  add(g, 'showrooms.hero.image', 'Первый экран — фото', showroomsListHero, 'image')
  add(g, 'showrooms.hero.title', 'Первый экран — заголовок', copy, 'heroTitle')
  add(g, 'showrooms.hero.lead', 'Первый экран — подзаголовок', copy, 'heroLead')
  add(g, 'showrooms.list.title', 'Список шоурумов — заголовок', copy, 'listLabel')
  add(g, 'showrooms.visit.title', 'Посещение — заголовок', copy, 'visitTitle')
  add(g, 'showrooms.visit.text', 'Посещение — текст', copy, 'visitLead')
  add(g, 'showrooms.visit.image', 'Посещение — фото', showroomsVisitBanner, 'image')
}

/* —— Каталог и типы —— */
{
  const g = 'Каталог'
  add(g, 'catalog.page.title', 'Весь каталог — заголовок', catalogCopy, 'allTitle')
  add(g, 'catalog.page.lead', 'Весь каталог — подзаголовок', catalogCopy, 'allLead')
}

/* —— По комнатам —— */
{
  const g = 'По комнатам'
  add(g, 'rooms.page.title', 'Страница — заголовок', roomsCopy, 'title')
  add(g, 'rooms.page.lead', 'Страница — подзаголовок', roomsCopy, 'lead')
}

/* —— Все бренды —— */
{
  const g = 'Все бренды'
  add(g, 'brandslist.page.title', 'Страница — заголовок', brandsPage, 'title')
  add(g, 'brandslist.page.lead', 'Страница — подзаголовок', brandsPage, 'lead')
}

/* —— Каталоги и материалы —— */
{
  const g = 'Каталоги и материалы'
  const copy = materialsCopy as unknown as Target
  add(g, 'materials.page.title', 'Страница — заголовок', copy, 'title')
  add(g, 'materials.page.lead', 'Страница — подзаголовок', copy, 'lead')
  add(g, 'materials.tab.catalogs', 'Вкладка каталогов — название', copy, 'catalogsTitle')
  add(g, 'materials.tab.docs', 'Вкладка документов — название', copy, 'docsTitle')
  add(g, 'materials.request.title', 'Запрос материалов — заголовок', copy, 'requestTitle')
  add(g, 'materials.request.text', 'Запрос материалов — текст', copy, 'requestText')
}

/* —— Запись на консультацию —— */
{
  const g = 'Запись'
  const copy = consultationCopy as unknown as Target
  add(g, 'request.title', 'Страница — заголовок', copy, 'title')
  add(g, 'request.format.showroom', 'Формат «в шоуруме» — название', copy, 'formatShowroom')
  add(g, 'request.format.online', 'Формат «онлайн» — название', copy, 'formatOnline')
  add(g, 'request.note', 'Подсказка под датой — текст', copy, 'confirmNote')
  add(g, 'request.check', 'Кнопка проверки — текст', copy, 'check')
  add(g, 'request.hello', 'Начало сообщения — текст', copy, 'messageHello')
  ;(['private', 'pro'] as const).forEach((audience) => {
    const group = serviceDirections[audience]
    const who = audience === 'private' ? 'Частному клиенту' : 'Дизайнеру'
    add(g, `request.dir.${audience}.title`, `${who}: вкладка — заголовок`, group, 'title')
    group.items.forEach((item, i) => {
      const n = i + 1
      add(g, `request.dir.${audience}.${n}.label`, `${who}, пункт ${n} — заголовок`, item, 'label')
      add(g, `request.dir.${audience}.${n}.hint`, `${who}, пункт ${n} — текст`, item, 'hint')
    })
  })
}

/** Кнопка: текст obj[labelKey] и ссылка obj[hrefKey] одним полем */
function addLink(group: string, id: string, label: string, obj: unknown, labelKey = 'label', hrefKey = 'href') {
  const target = obj as Target
  if (typeof target?.[labelKey] !== 'string' || typeof target?.[hrefKey] !== 'string') return
  const read = () => JSON.stringify({ label: String(target[labelKey]), href: String(target[hrefKey]) })
  fields.push({
    id,
    group,
    label,
    kind: 'link',
    defaultValue: read(),
    block: blockFor(id),
    extra: true,
    get: read,
    apply(value) {
      try {
        const next = JSON.parse(value)
        if (typeof next.label === 'string' && next.label.trim()) target[labelKey] = next.label
        if (typeof next.href === 'string' && next.href.trim()) target[hrefKey] = next.href
      } catch {
        /* битое значение — остаётся как было */
      }
    },
  })
}

/** Подпись или служебный текст страницы — в списке «Кнопки и подписи» */
function addExtra(group: string, id: string, label: string, obj: unknown, key: string) {
  const before = fields.length
  add(group, id, label, obj, key)
  if (fields.length > before) fields[fields.length - 1]!.extra = true
}

/* —— Кнопки и подписи —— */
{
  let g = 'Главная'
  addExtra(g, 'home.hero.kicker', 'Надпись над заголовком', homeHero, 'label')
  addLink(g, 'home.hero.cta1', 'Первый экран — кнопка 1', homeHero.primaryCta)
  addLink(g, 'home.hero.cta2', 'Первый экран — кнопка 2', homeHero.secondaryCta)
  addLink(g, 'home.featured.cta', 'По комнатам — кнопка', homeSections.featured.cta)
  addLink(g, 'home.brands.cta', 'Бренды — кнопка', homeSections.brands.cta)
  addLink(g, 'home.interiors.cta', 'Интерьеры — кнопка', homeSections.interiors.cta)
  addLink(g, 'home.partners.cta', 'Подбор и комплектация — кнопка', homeSections.partners.cta)
  addLink(g, 'home.partners.trade', 'Подбор и комплектация — вторая ссылка', homeSections.partners.tradeLink)
  addLink(g, 'home.showrooms.cta', 'Шоурумы — кнопка', homeSections.showrooms.cta)

  g = 'Услуги'
  addLink(g, 'services.hero.cta', 'Кнопка «Обсудить проект» (вверху и внизу)', podbor, 'primaryCta', 'requestHref')
  addLink(g, 'services.interiors.cta', 'Интерьеры — ссылка', podbor, 'interiorsLink', 'interiorsHref')

  g = 'О галерее'
  addExtra(g, 'about.approach.label', 'Наш подход — подпись блока', aboutCopy, 'approachLabel')
  addLink(g, 'about.approach.cta', 'Наш подход — кнопка', aboutCopy, 'approachCta', 'approachHref')
  addExtra(g, 'about.brands.label', 'Бренды — подпись блока', aboutCopy, 'brandsLabel')
  addLink(g, 'about.brands.cta', 'Бренды — кнопка', aboutCopy, 'brandsCta', 'brandsHref')

  g = 'Профессионалам'
  tradeCards.forEach((card, i) => addLink(g, `trade.card${i + 1}.cta`, `Дизайнерам, карточка ${i + 1} — кнопка`, card, 'cta', 'href'))
  tradeDevelopers.cards.forEach((card, i) =>
    addLink(g, `trade.dev${i + 1}.cta`, `Девелоперам, карточка ${i + 1} — кнопка`, card, 'cta', 'href'),
  )
  addLink(g, 'trade.coop.cta', 'Сотрудничество — кнопка', tradeCopy, 'coopCta', 'coopHref')

  g = 'Шоурумы'
  const sc = showroomsCopy as unknown as Target
  addLink(g, 'showrooms.visit.cta', 'Посещение — кнопка', sc, 'visitCta', 'visitHref')
  addExtra(g, 'showrooms.row.visit', 'Карточка шоурума — кнопка записи', sc, 'visitRowCta')
  addExtra(g, 'showrooms.row.route', 'Карточка шоурума — «Построить маршрут»', sc, 'routeCta')
  addExtra(g, 'showrooms.row.photo', 'Карточка шоурума — «Показать фото»', sc, 'photoCta')

  g = 'Интерьеры'
  const ic = interiorsCopy as unknown as Target
  for (const [key, label] of [
    ['introLabel', 'Вступление — подпись блока'],
    ['rowCta', 'Список — кнопка интерьера'],
    ['detailModelsTitle', 'Страница интерьера — «Предметы в интерьере»'],
    ['detailModelsLead', 'Страница интерьера — текст о предметах'],
    ['similarTitle', 'Страница интерьера — «Подойдут к этому интерьеру»'],
    ['similarLead', 'Страница интерьера — текст о подборке'],
    ['detailProductCta', 'Страница интерьера — кнопка товара'],
    ['backToList', 'Страница интерьера — ссылка «Все подборки»'],
    ['originBrand', 'Подпись «Интерьер бренда»'],
    ['originGallery', 'Подпись «Проект ID Gallery»'],
  ] as const) addExtra(g, `interiors.label.${key}`, label, ic, key)

  g = 'Карьера'
  const cc = careerCopy as unknown as Target
  for (const [key, label] of [
    ['heroLink', 'Первый экран — ссылка к вакансиям'],
    ['vacanciesTitle', 'Вакансии — заголовок'],
    ['noVacancies', 'Вакансии — текст, когда их нет'],
    ['apply', 'Вакансия — кнопка «Откликнуться»'],
    ['formTitle', 'Отклик — заголовок'],
    ['fieldName', 'Отклик — поле «Имя»'],
    ['fieldContact', 'Отклик — поле «Контакт»'],
    ['fieldAbout', 'Отклик — поле «О себе»'],
    ['fieldLink', 'Отклик — поле «Ссылка на резюме»'],
    ['submit', 'Отклик — кнопка'],
    ['errorRequired', 'Отклик — ошибка «Заполните поле»'],
  ] as const) addExtra(g, `career.label.${key}`, label, cc, key)

  g = 'Контакты'
  const kc = contactPageCopy as unknown as Target
  for (const [key, label] of [
    ['infoTitle', 'Контакты — заголовок блока'],
    ['formTitle', 'Форма — заголовок'],
    ['fieldName', 'Форма — поле «Имя»'],
    ['fieldContact', 'Форма — поле «Контакт»'],
    ['fieldMessage', 'Форма — поле «Сообщение»'],
    ['submit', 'Форма — кнопка'],
    ['errorRequired', 'Форма — ошибка «Заполните поле»'],
  ] as const) addExtra(g, `contact.label.${key}`, label, kc, key)
  const hints = (contactPageCopy as unknown as { topicHints: Target }).topicHints
  addExtra(g, 'contact.label.topic.visit', 'Тема — посещение шоурума', hints, 'visit')
  addExtra(g, 'contact.label.topic.materials', 'Тема — запрос материалов', hints, 'materials')
  addExtra(g, 'contact.label.topic.trade', 'Тема — сотрудничество', hints, 'trade')

  g = 'Запись'
  const rc = consultationCopy as unknown as Target
  for (const [key, label] of [
    ['fieldShowroom', 'Форма — поле «Шоурум»'],
    ['showroomPlaceholder', 'Форма — «Выберите шоурум»'],
    ['fieldDate', 'Форма — поле «Дата»'],
    ['fieldTime', 'Форма — поле «Время»'],
    ['fieldName', 'Форма — поле «Имя»'],
    ['fieldContact', 'Форма — поле «Контакт»'],
    ['fieldComment', 'Форма — поле «Комментарий»'],
    ['itemsTitle', 'Форма — «Предметы для обсуждения»'],
    ['variantPending', 'Форма — «Исполнение уточняется»'],
    ['previewTitle', 'Проверка — заголовок'],
    ['linkNote', 'Проверка — подсказка о ссылке'],
    ['openWhatsApp', 'Проверка — кнопка WhatsApp'],
    ['copyText', 'Проверка — «Скопировать текст»'],
    ['copied', 'Проверка — «Текст скопирован»'],
    ['editData', 'Проверка — «Изменить данные»'],
    ['altTitle', 'Другой способ связи — заголовок'],
    ['altLead', 'Другой способ связи — текст'],
    ['call', 'Другой способ связи — «Позвонить»'],
    ['email', 'Другой способ связи — «Написать по почте»'],
    ['altNote', 'Другой способ связи — подпись'],
    ['sentNote', 'Напоминание после WhatsApp'],
    ['errorContact', 'Ошибка — нет контакта'],
    ['errorDatePast', 'Ошибка — дата в прошлом'],
  ] as const) addExtra(g, `request.label.${key}`, label, rc, key)

  g = 'Каталоги и материалы'
  const mc = materialsCopy as unknown as Target
  for (const [key, label] of [
    ['brandAll', 'Фильтр — «Все фабрики»'],
    ['typeLabel', 'Фильтр — «Тип предмета»'],
    ['typeAll', 'Фильтр — «Все»'],
    ['openDocument', 'Документ — «Открыть документ»'],
    ['notPublished', 'Документ — «Не опубликовано»'],
    ['requestMaterials', 'Кнопка «Запросить материалы»'],
    ['showMore', 'Кнопка «Показать ещё»'],
    ['noCatalogs', 'Текст, когда каталогов нет'],
    ['nothingFound', 'Текст, когда документов нет'],
  ] as const) addExtra(g, `materials.label.${key}`, label, mc, key)
}

/* —— Для поисковиков: группа страницы → адрес —— */
{
  const groups: [string, string][] = [
    ['Главная', '/'],
    ['Каталог', '/catalog'],
    ['По комнатам', '/rooms'],
    ['Все бренды', '/brands'],
    ...brands.map((brand): [string, string] => [`Бренд ${brand.name}`, `/brands/${brand.slug}`]),
    ['Интерьеры', '/interiors'],
    ['Услуги', '/services/podbor'],
    ['Профессионалам', '/trade'],
    ['О галерее', '/about'],
    ['Контакты', '/contact'],
    ['Шоурумы', '/showrooms'],
    ['Карьера', '/career'],
    ['Каталоги и материалы', '/materials'],
    ['Запись', '/request'],
  ]
  for (const [group, path] of groups) {
    const seo = seoPages[path]
    if (!seo) continue
    for (const [key, label] of [
      ['title', 'Для поисковиков — заголовок'],
      ['description', 'Для поисковиков — описание'],
    ] as const) {
      /* пустое значение из кода — тоже поле: заголовок добавляется с нуля */
      const target = seo as unknown as Target
      fields.push({
        id: `seo.${path === '/' ? 'home' : path.slice(1).replace(/\//g, '.')}.${key}`,
        group,
        label,
        kind: key === 'description' ? 'textarea' : 'text',
        defaultValue: String(target[key] || ''),
        seo: true,
        get: () => String(target[key] || ''),
        apply(value) {
          target[key] = value
        },
      })
    }
  }
}

export const editableFields: readonly EditableField[] = fields

/** Страницы визуального редактора: группа полей → адрес страницы на сайте */
export type EditablePage = { group: string; label: string; path: string }

export const editablePages: EditablePage[] = [
  { group: 'Главная', label: 'Главная', path: '/' },
  { group: 'Услуги', label: 'Услуги', path: '/services/podbor' },
  ...brands.map((brand) => ({
    group: `Бренд ${brand.name}`,
    label: `Бренд ${brand.name}`,
    path: `/brands/${brand.slug}`,
  })),
  { group: 'Интерьеры', label: 'Интерьеры', path: '/interiors' },
  { group: 'Профессионалам', label: 'Профессионалам', path: '/trade' },
  { group: 'О галерее', label: 'О галерее', path: '/about' },
  { group: 'Контакты', label: 'Контакты', path: '/contact' },
  { group: 'Карьера', label: 'Карьера', path: '/career' },
]

/** Группа полей для адреса страницы (без хвостового «/») */
export function groupForPath(pathname: string) {
  const clean = pathname.replace(/\/+$/, '') || '/'
  return editablePages.find((page) => page.path === clean)?.group || ''
}

const byId = new Map(fields.map((field) => [field.id, field]))

/** Применить правки из базы; неизвестные id пропускаются */
export function applyContentOverrides(values: Record<string, string>) {
  for (const [id, value] of Object.entries(values)) {
    if (typeof value === 'string' && value.trim()) byId.get(id)?.apply(value)
  }
}

export function getEditableField(id: string) {
  return byId.get(id) || null
}
