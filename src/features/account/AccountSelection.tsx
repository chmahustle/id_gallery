import { ArrowRight } from 'lucide-react'
import { useId } from 'react'
import { Link } from 'react-router-dom'
import { useUserAuth } from '../../auth/UserAuthContext'
import { useCart } from '../../cart/CartContext'
import { productPath } from '../../catalog/catalog'
import { Button } from '../../components/ui'
import { categories } from '../../data/categories'
import { products } from '../../data/products'
import { resolveBrandName } from '../../lib/catalog'
import { getPreviousLocation, saveFinish } from '../../lib/navHistory'
import { useSelection } from '../../selection/SelectionContext'
import type { Product, ProductVariant } from '../../types'
import './AccountSelection.css'

type Position = {
  id: string
  slug: string
  variantId: string
  forRequest: boolean
}

function positionsLabel(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return `${n} позиция`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} позиции`
  return `${n} позиций`
}

function findVariant(product: Product, variantId: string): ProductVariant | null {
  if (!variantId) return null
  const finishes = [...(product.colors || []), ...(product.variants || [])]
  return finishes.find((item) => item.id === variantId) || null
}

function typeOf(product: Product) {
  return (
    categories.find((item) => item.slug === product.categorySlug)?.singular ||
    product.subcategory ||
    product.category
  )
}

/** Личный кабинет после входа: «Моя подборка» */
export function AccountSelection() {
  const { user, logout } = useUserAuth()
  const { addMissing } = useCart()
  const selection = useSelection()
  const commentId = useId()

  const bySlug = new Map(products.map((item) => [item.slug, item]))
  const rows = (selection.items as Position[])
    .map((position) => {
      const product = bySlug.get(position.slug)
      if (!product) return null
      return { position, product, variant: findVariant(product, position.variantId) }
    })
    .filter(Boolean) as {
    position: Position
    product: Product
    variant: ProductVariant | null
  }[]

  const forRequest = rows.filter((row) => row.position.forRequest)
  const previous = getPreviousLocation()
  const continueHref =
    previous && !previous.pathname.startsWith('/account')
      ? `${previous.pathname}${previous.search}`
      : '/catalog'

  /* визит: модели и исполнения отмеченных позиций */
  const visitParams = new URLSearchParams({ type: 'visit' })
  for (const row of forRequest) {
    visitParams.append('model', row.product.slug)
    visitParams.append('variant', row.variant?.id || '')
  }

  return (
    <section className="account-selection" aria-labelledby="account-selection-title">
      <div className="account-selection__head">
        <h1 id="account-selection-title" className="account-selection__title">
          {`Моя подборка · ${positionsLabel(rows.length)}`}
        </h1>
        <Link className="account-selection__link" to={continueHref}>
          Продолжить просмотр
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="account-selection__empty">
          <p>
            В подборке пока нет моделей. Сохраните модель в карточке — она появится
            здесь вместе с выбранным исполнением.
          </p>
          <Button as={Link} variant="primary" withArrow to="/catalog">
            Все товары
          </Button>
        </div>
      ) : (
        <>
          <ul className="account-selection__list">
            {rows.map(({ position, product, variant }) => (
              <li key={position.id} className="account-selection__item">
                <span className="account-selection__thumb">
                  {variant?.image || product.image ? (
                    <img src={variant?.image || product.image} alt="" />
                  ) : null}
                </span>
                <div className="account-selection__info">
                  <p className="account-selection__name">
                    {`${resolveBrandName(product)} · ${product.name}`}
                  </p>
                  <p className="account-selection__meta">
                    {`${typeOf(product)} · ${
                      variant?.name ? `Исполнение: ${variant.name}` : 'Исполнение не выбрано'
                    }`}
                  </p>
                  <Link
                    className="account-selection__link"
                    to={productPath(product.slug)}
                    onClick={() => {
                      /* карточка откроется с этим исполнением */
                      if (variant) saveFinish(product.slug, variant.id)
                    }}
                  >
                    Открыть модель
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
                <label className="account-selection__check">
                  <input
                    type="checkbox"
                    checked={position.forRequest}
                    onChange={() => selection.toggleRequest(position.id)}
                  />
                  <span>{position.forRequest ? 'Выбрано для запроса' : 'Не в запросе'}</span>
                </label>
                <button
                  type="button"
                  className="account-selection__remove"
                  onClick={() => selection.remove(position.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>

          <div className="account-selection__comment">
            <label htmlFor={commentId}>Комментарий к подборке</label>
            <textarea
              id={commentId}
              rows={2}
              value={selection.comment}
              placeholder="Например: уточнить доступные варианты обивки"
              onChange={(event) => selection.setComment(event.target.value)}
            />
          </div>

          <div className="account-selection__actions">
            <button
              type="button"
              className="account-selection__clear"
              onClick={selection.clear}
            >
              Очистить подборку
            </button>
            <div className="account-selection__buttons">
              <Button
                as={Link}
                variant="secondary"
                to={`/request/?${visitParams}`}
                aria-disabled={forRequest.length === 0 || undefined}
              >
                Запланировать визит
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={forRequest.length === 0}
                onClick={() =>
                  addMissing(
                    forRequest.map((row) => ({ product: row.product, variant: row.variant })),
                  )
                }
              >
                Запросить предложение
              </Button>
            </div>
          </div>
        </>
      )}

      <p className="account-selection__user">
        {user?.email ? `Вы вошли как ${user.email}. ` : 'Вы вошли. '}
        <button type="button" onClick={() => void logout()}>
          Выйти
        </button>
      </p>
    </section>
  )
}
