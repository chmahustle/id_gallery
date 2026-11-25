import { brands } from '../data/brands'
import { categories } from '../data/categories'
import type {
  CharacteristicField,
  Product,
  ProductCharacteristics,
  ProductDocument,
  ProductVariant,
} from '../types'
import { slugify as toSlug } from './adminSlug'

/*
 * Форма редактора товара (вкладка «Товары») и её перевод в товар сайта и
 * обратно. Отдельно от экрана — чтобы проверять тестами.
 */

export const slugify = (text: unknown) => toSlug(text, { max: 100 })

/** Поле характеристики в форме: текст и «подтверждено» */
export type SpecInput = { value: string; approved: boolean }
export type SpecKey = keyof ProductCharacteristics

export const SPEC_KEYS: [SpecKey, string][] = [
  ['dimensions', 'Размеры'],
  ['materials', 'Материалы'],
  ['finishes', 'Отделки'],
  ['sku', 'Артикул'],
]

export type VariantForm = {
  id: string
  name: string
  swatch: string
  images: string[]
  dimensions: SpecInput
  materials: SpecInput
}

export type MaterialForm = { name: string; image: string; note: string }

export type ProductForm = {
  slug: string
  name: string
  brandSlug: string
  categorySlug: string
  summary: string
  shortDescription: string
  images: string[]
  variants: VariantForm[]
  materialSwatches: MaterialForm[]
  specs: Record<SpecKey, SpecInput>
  rooms: string[]
  collection: string
  price: string
  author: string
  documents: ProductDocument[]
  care: string
}

/** Откуда товар: только из кода, из кода с правками в базе, или новый из админки */
export type ProductSource = 'code' | 'changed' | 'admin'

export type ProductRow = {
  slug: string
  product: Partial<Product> & { slug: string }
  source: ProductSource
  published: boolean
}

export type ProductEditing = {
  isNew: boolean
  form: ProductForm
  published: boolean
  source?: ProductSource
}

const specInput = (field: CharacteristicField | undefined): SpecInput => ({
  value: field?.value || '',
  approved: field?.status === 'approved',
})

/** Пустое исполнение для кнопки «+ Цвет или исполнение» */
export const emptyVariant = (): VariantForm => ({
  id: '',
  name: '',
  swatch: '',
  images: [],
  dimensions: { value: '', approved: false },
  materials: { value: '', approved: false },
})

/** Товар → форма редактора; null — новый товар */
export function toForm(product: Partial<Product> | null): ProductForm {
  const chars = product?.characteristics || {}
  return {
    slug: product?.slug || '',
    name: product?.name || '',
    brandSlug: product?.brandSlug || brands[0]?.slug || '',
    categorySlug: product?.categorySlug || categories[0]?.slug || '',
    summary: product?.summary || '',
    shortDescription: product?.shortDescription || '',
    images: [...(product?.images || (product?.image ? [product.image] : []))],
    variants: (product?.variants || product?.colors || []).map((item: ProductVariant) => ({
      id: item.id,
      name: item.name || '',
      swatch: item.swatch || '',
      images: item.images?.length ? [...item.images] : item.image ? [item.image] : [],
      dimensions: specInput(item.dimensions),
      materials: specInput(item.materials),
    })),
    materialSwatches: (product?.materialSwatches || []).map((item) => ({
      name: item.name || '',
      image: item.image || '',
      note: item.note || '',
    })),
    specs: Object.fromEntries(SPEC_KEYS.map(([key]) => [key, specInput(chars[key])])) as Record<
      SpecKey,
      SpecInput
    >,
    rooms: [...(product?.rooms || [])],
    collection: product?.collection || '',
    price: product?.price || '',
    author: product?.author?.name || '',
    documents: (product?.documents || []).map((doc) => ({ ...doc })),
    care: product?.care || '',
  }
}

/** Значение характеристики: пустое не сохраняется, «подтверждено» — статус */
const toField = (spec: SpecInput): CharacteristicField | undefined =>
  spec.value.trim()
    ? { value: spec.value.trim(), status: spec.approved ? 'approved' : 'placeholder' }
    : undefined

/** Форма → данные товара для базы */
export function fromForm(form: ProductForm): Partial<Product> {
  const brand = brands.find((item) => item.slug === form.brandSlug)
  const category = categories.find((item) => item.slug === form.categorySlug)
  const characteristics: ProductCharacteristics = {}
  for (const [key] of SPEC_KEYS) {
    const field = form.specs[key] ? toField(form.specs[key]) : undefined
    if (field) characteristics[key] = field
  }
  const images = form.images.filter(Boolean)
  return {
    name: form.name.trim(),
    brand: brand?.name || form.brandSlug,
    brandSlug: form.brandSlug,
    category: category?.label || form.categorySlug,
    categorySlug: form.categorySlug,
    subcategory: category?.singular || category?.label || '',
    summary: form.summary.trim(),
    shortDescription: form.shortDescription.trim(),
    images,
    image: images[0] || '',
    variants: form.variants
      .filter((item) => item.name.trim())
      .map((item, i): ProductVariant => {
        const variantImages = item.images.filter(Boolean)
        const dimensions = toField(item.dimensions)
        const materials = toField(item.materials)
        return {
          id: item.id || `v${i + 1}-${slugify(item.name)}`,
          name: item.name.trim(),
          ...(item.swatch ? { swatch: item.swatch } : {}),
          ...(variantImages.length ? { image: variantImages[0], images: variantImages } : {}),
          ...(dimensions ? { dimensions } : {}),
          ...(materials ? { materials } : {}),
          status: 'approved',
        }
      }),
    materialSwatches: form.materialSwatches
      .filter((item) => item.name.trim())
      .map((item) => ({
        name: item.name.trim(),
        ...(item.image ? { image: item.image } : {}),
        ...(item.note.trim() ? { note: item.note.trim() } : {}),
      })),
    characteristics,
    rooms: form.rooms,
    ...(form.collection.trim() ? { collection: form.collection.trim() } : {}),
    ...(form.price.trim() ? { price: form.price.trim() } : {}),
    ...(form.author.trim()
      ? { author: { name: form.author.trim(), slug: slugify(form.author) } }
      : {}),
    documents: form.documents
      .filter((doc) => doc.title.trim() && doc.url)
      .map((doc) => ({ title: doc.title.trim(), url: doc.url, format: doc.format || 'PDF' })),
    care: form.care.trim(),
  }
}
