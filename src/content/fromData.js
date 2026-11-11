/**
 * Адаптеры src/data → формы, которые ждут старые импорты content.js.
 * Списки брендов/категорий/меню живут только в src/data.
 */
import { brands } from '../data/brands'
import { categories } from '../data/categories'
import { navigation } from '../data/navigation'
import { products as demoProducts } from '../data/products'
import { site as siteData } from '../data/site'

export const site = {
  name: siteData.name,
  tagline: siteData.tagline,
  description: siteData.description,
  locale: siteData.locale,
}

export const contacts = {
  address: siteData.locale,
  addressDetail: '[Адрес]',
  phone: '[Телефон]',
  phoneHref: '#',
  email: '[Email]',
  emailHref: '#',
  hours: '',
  whatsapp: '',
}

export const mainNav = navigation.map((section) => ({
  label: section.title,
  href: section.links[0]?.href || '/',
}))

export const catalogCategories = categories.map((cat) => ({
  label: cat.label,
  slug: cat.slug,
  href: cat.href,
  children: cat.children || [],
  brands: brands.map((b) => b.name),
  description: cat.description,
  status: cat.status,
}))

export const brandLogos = brands.map((brand) => ({
  name: brand.name,
  filter: brand.filter,
  logo: brand.logo,
  slug: brand.slug,
  description: brand.description,
  status: brand.status,
}))

function approvedCharValue(field) {
  if (!field || field.status !== 'approved') return null
  return field.value || null
}

export const products = demoProducts.map((item) => {
  const materials = approvedCharValue(item.characteristics?.materials)
  const dimensions = approvedCharValue(item.characteristics?.dimensions)
  const finishes = approvedCharValue(item.characteristics?.finishes)
  const sku = approvedCharValue(item.characteristics?.sku)
  return {
    ...item,
    description: item.shortDescription,
    specs: {
      ...(materials ? { Материалы: materials } : {}),
      ...(dimensions ? { Размеры: dimensions } : {}),
      ...(finishes ? { Отделки: finishes } : {}),
      ...(sku ? { Артикул: sku } : {}),
    },
    colors: item.variants || item.colors || [],
    sku: item.characteristics?.sku?.value || item.slug,
    price: siteData.cta.priceOnRequest,
    priceAmount: null,
    statusLabel: item.status,
    categorySlug: item.categorySlug,
  }
})

/** Устарело: страница /contact/ берёт данные из data/contact-page.ts */
export const contactsPage = {
  title: 'Контакты',
  hoursLabel: '',
  showrooms: [],
  departments: [],
}

export { navigation as menuColumns }
