import type { BrandCatalog, Product, ProductDocument } from '../types'
import { brands } from './brands'
import { products } from './products'

/**
 * /materials/ — «Каталоги и материалы», одна библиотека.
 * Каталог товаров ведёт к моделям, библиотека — к источникам фабрик и документам.
 */
export const materialsCopy = {
  title: 'Каталоги и материалы',
  lead: 'Каталоги фабрик и технические документы по моделям и отделке.',
  brandAll: 'Все фабрики',
  brandLabel: 'Фабрика',
  catalogsTitle: 'Каталоги фабрик',
  docsTitle: 'Технические материалы',
  openDocument: 'Открыть документ',
  notPublished: 'Не опубликовано',
  requestMaterials: 'Запросить материалы',
  showMore: 'Показать ещё',
  typeAll: 'Все',
  typeLabel: 'Тип предмета',
  noCatalogs: 'Каталоги этой фабрики пока не опубликованы. Их можно запросить у специалиста.',
  nothingFound: 'Моделей этого типа с документами нет.',
  requestTitle: 'Не нашли нужный документ?',
  requestText: 'Специалист уточнит наличие каталогов, чертежей и материалов по модели.',
} as const

export type LibraryCatalog = BrandCatalog & { brandSlug: string; brandName: string }

/** Каталоги фабрик: только с файлом; пустой ссылки нет */
export function getLibraryCatalogs(brandSlug = ''): LibraryCatalog[] {
  return brands
    .filter((brand) => !brandSlug || brand.slug === brandSlug)
    .flatMap((brand) =>
      (brand.catalogs || [])
        .filter((item) => Boolean(item.url))
        .map((item) => ({ ...item, brandSlug: brand.slug, brandName: brand.name })),
    )
}

export type LibraryModel = {
  product: Product
  /** Документы с файлом */
  published: ProductDocument[]
  /** Заявлены, но без файла — ссылки нет, только запрос специалисту */
  pending: ProductDocument[]
}

/** Технические материалы: модели, у которых есть документы (с файлом или без) */
export function getLibraryModels(brandSlug = ''): LibraryModel[] {
  return products
    .filter((product) => !brandSlug || product.brandSlug === brandSlug)
    .map((product) => {
      const docs = (product.documents || []).filter((doc) => doc.title)
      return {
        product,
        published: docs.filter((doc) => Boolean(doc.url)),
        pending: docs.filter((doc) => !doc.url),
      }
    })
    .filter((item) => item.published.length + item.pending.length > 0)
}

/** Запрос материалов специалисту: тема и предмет — отдельными значениями */
export function materialsRequestHref(brandSlug = '', modelSlug = '') {
  const params = new URLSearchParams({ topic: 'materials' })
  if (brandSlug) params.set('brand', brandSlug)
  if (modelSlug) params.set('model', modelSlug)
  return `/contact/?${params}`
}
