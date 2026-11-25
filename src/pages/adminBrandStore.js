import { api } from '../api'
import { brands } from '../data/brands'
import { applyAdminBrands } from '../data/brandsRuntime'

/**
 * Записи брендов из админки: одна копия на всю админку (вкладка «Бренды»,
 * конструктор страниц бренда). После каждого сохранения бренды на сайте
 * пересобираются.
 */
let records = []
let loaded = null

export function loadBrandRecords(force = false) {
  if (!loaded || force) {
    loaded = api('/api/brand-records').then((data) => {
      records = data.items || []
      applyAdminBrands(records)
      return records
    })
  }
  return loaded
}

export function getBrandRecords() {
  return records
}

export function getBrandRecord(slug) {
  return records.find((item) => item.slug === slug) || null
}

/** Сохранить бренд целиком */
export async function saveBrandRecord(slug, data, published = true) {
  const { item } = await api(`/api/brand-records/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify({ data, published }),
  })
  records = [...records.filter((rec) => rec.slug !== slug), item]
  applyAdminBrands(records)
  return item
}

/** Изменить одно поле бренда (из конструктора); undefined — вернуть из кода */
export async function saveBrandField(slug, key, value) {
  const record = getBrandRecord(slug)
  const brand = brands.find((item) => item.slug === slug)
  const data = { ...(record?.data || { name: brand?.name || slug }) }
  if (value === undefined) delete data[key]
  else data[key] = value
  return saveBrandRecord(slug, data, record ? record.published : true)
}

export async function deleteBrandRecord(slug) {
  await api(`/api/brand-records/${encodeURIComponent(slug)}`, { method: 'DELETE' })
  records = records.filter((rec) => rec.slug !== slug)
  applyAdminBrands(records)
}
