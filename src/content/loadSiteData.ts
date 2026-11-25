import { applyAdminBrands, type AdminBrandRecord } from '../data/brandsRuntime'
import { applyContactsList, applyShowroomsList } from '../data/contactsRuntime'
import { applyInteriorRecords } from '../data/interiorsRuntime'
import { applyAdminProducts, type AdminProductRecord } from '../data/productsRuntime'
import { applyVacancies } from '../data/career'
import { applyRoomsList, applyTypesList } from '../data/catalogRuntime'
import { applyFooter, applyMenu, applyTopNav } from '../data/navigation'
import { applyHomeOrder, setBrandStrip, setFeaturedPicks } from '../data/home'
import { setServicesOrder } from '../data/services'
import { applyContentOverrides } from './editable'
import { scrubContentValues, scrubUnsafe } from '../lib/safeLinks'
import { contentResponseSchema, validRecords } from './schemas'

/** Правки из админки (тексты, фото, товары) — до первой отрисовки сайта */
async function getJson<T>(url: string, signal: AbortSignal): Promise<T | null> {
  try {
    const response = await fetch(url, { signal, credentials: 'include' })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

export async function loadSiteData() {
  /* без API сайт открывается с данными из кода — ждём не дольше 4 секунд */
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 4000)
  const [rawContent, rawProducts, rawBrands] = await Promise.all([
    getJson<unknown>('/api/content', controller.signal),
    getJson<unknown>('/api/products', controller.signal),
    getJson<unknown>('/api/brand-records', controller.signal),
  ])
  window.clearTimeout(timer)
  /* опасные ссылки (javascript:) из любых правок не попадают на сайт */
  /* ответы API проверяются по схеме: неверные записи отбрасываются по одной */
  const parsedContent = contentResponseSchema.safeParse(rawContent)
  const content = parsedContent.success
    ? { values: scrubContentValues(parsedContent.data.values) }
    : null
  const productItems = validRecords(rawProducts)
  const brandItems = validRecords(rawBrands)
  const productsData = productItems
    ? { items: scrubUnsafe(productItems) as unknown as AdminProductRecord[] }
    : null
  const brandsData = brandItems
    ? { items: scrubUnsafe(brandItems) as unknown as AdminBrandRecord[] }
    : null
  /* бренды — до правок текстов: поля брендов в реестре указывают на те же объекты */
  if (brandsData?.items) applyAdminBrands(brandsData.items)
  if (content?.values) {
    /* типы и комнаты — первыми: от них зависят каталог, меню и товары */
    for (const [key, apply] of [
      ['catalog.types', applyTypesList],
      ['catalog.rooms', applyRoomsList],
    ] as const) {
      if (!content.values[key]) continue
      try {
        apply(JSON.parse(content.values[key]))
      } catch {
        /* из кода */
      }
    }
        /* интерьеры — до правок текстов: поля интерьеров в реестре указывают на те же объекты */
    if (content.values['interiors.records']) {
      try {
        applyInteriorRecords(JSON.parse(content.values['interiors.records']))
      } catch {
        /* интерьеры из кода */
      }
    }
    applyContentOverrides(content.values)
    if (content.values['home.order']) applyHomeOrder(content.values['home.order'])
    if (content.values['home.featured.picks']) {
      try {
        setFeaturedPicks(JSON.parse(content.values['home.featured.picks']))
      } catch {
        /* автоматический выбор */
      }
    }
    if (content.values['home.brands.strip']) {
      try {
        setBrandStrip(JSON.parse(content.values['home.brands.strip']))
      } catch {
        /* все бренды */
      }
    }
    /* контакты и шоурумы из вкладки «Контакты и шоурумы» */
    for (const [key, apply] of [
      ['contacts.list', applyContactsList],
      ['showrooms.list', applyShowroomsList],
      ['career.vacancies', applyVacancies],
      ['nav.top', applyTopNav],
      ['nav.menu', applyMenu],
      ['nav.footer', applyFooter],
    ] as const) {
      if (!content.values[key]) continue
      try {
        apply(JSON.parse(content.values[key]))
      } catch {
        /* данные из кода */
      }
    }
    if (content.values['services.order']) {
      try {
        setServicesOrder(JSON.parse(content.values['services.order']))
      } catch {
        /* порядок из кода */
      }
    }
  }
  if (productsData?.items) applyAdminProducts(productsData.items)
}
