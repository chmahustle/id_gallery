import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCompare } from '../../compare/CompareContext'
import { confirmedValue } from '../../compare/comparable'
import { productPath } from '../../catalog/catalog'
import { Button } from '../../components/ui'
import { categories } from '../../data/categories'
import { products } from '../../data/products'
import { resolveBrandName } from '../../lib/catalog'
import { saveFinish } from '../../lib/navHistory'
import type { Product, ProductVariant } from '../../types'
import './ComparePage.css'

type CompareItem = { slug: string; variantId: string }

function modelsLabel(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} модель`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} модели`
  return `${n} моделей`
}

function findVariant(product: Product, variantId: string): ProductVariant | null {
  if (!variantId) return null
  const finishes = [...(product.colors || []), ...(product.variants || [])]
  return finishes.find((item) => item.id === variantId) || null
}

/** /compare — 2–4 модели одного типа с выбранными исполнениями */
export function ComparePage() {
  const compare = useCompare()
  const bySlug = new Map(products.map((item) => [item.slug, item]))
  const rows = (compare.items as CompareItem[])
    .map((item) => {
      const product = bySlug.get(item.slug)
      return product ? { product, variant: findVariant(product, item.variantId) } : null
    })
    .filter(Boolean) as { product: Product; variant: ProductVariant | null }[]

  const category = categories.find((item) => item.slug === compare.categorySlug)
  const typeLabel = category?.singular || category?.label || ''
  const catalogHref = category ? `/catalog/${category.slug}` : '/catalog'

  return (
    <section className="compare-page" aria-labelledby="compare-title">
      <div className="compare-page__head">
        <h1 id="compare-title" className="compare-page__title">
          {rows.length ? `Сравнить · ${modelsLabel(rows.length)}` : 'Сравнение'}
        </h1>
        {category ? (
          <Link className="compare-page__link" to={catalogHref}>
            {`Все: ${category.label}`}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {rows.length >= 2 ? (
        <div
          className="compare-page__grid"
          style={{ ['--compare-cols' as string]: rows.length }}
        >
          {rows.map(({ product, variant }) => {
            const image = variant?.image || product.image
            const dimensions = confirmedValue(variant?.dimensions)
            const materials = confirmedValue(variant?.materials)
            return (
              <article key={product.slug} className="compare-page__col">
                <Link
                  className="compare-page__media"
                  to={productPath(product.slug)}
                  onClick={() => {
                    if (variant) saveFinish(product.slug, variant.id)
                  }}
                >
                  {image ? (
                    <img src={image} alt="" />
                  ) : (
                    <span className="compare-page__ph">Фото из карточки</span>
                  )}
                </Link>
                <h2 className="compare-page__name">
                  {`${resolveBrandName(product)} · ${product.name}`}
                </h2>
                <dl className="compare-page__specs">
                  <div>
                    <dt>Тип</dt>
                    <dd>{typeLabel || product.category}</dd>
                  </div>
                  <div>
                    <dt>Исполнение</dt>
                    <dd>{variant?.name || 'Исполнение уточняется'}</dd>
                  </div>
                  <div>
                    <dt>Размеры</dt>
                    <dd>{dimensions || 'Размеры не подтверждены'}</dd>
                  </div>
                  <div>
                    <dt>Материалы</dt>
                    <dd>{materials || 'Материалы не подтверждены'}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="compare-page__remove"
                  onClick={() => compare.remove(product.slug)}
                >
                  Убрать
                </button>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="compare-page__empty" role="status">
          <p>
            {rows.length === 1
              ? `Добавьте ещё одну модель для сравнения. Сейчас в сравнении: ${resolveBrandName(rows[0]!.product)} · ${rows[0]!.product.name}.`
              : 'Добавьте модели одного типа — кнопка «Сравнить» есть в карточке модели.'}
          </p>
          <Button as={Link} variant="primary" withArrow to={catalogHref}>
            {category ? category.label : 'Все товары'}
          </Button>
        </div>
      )}
    </section>
  )
}
