import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { buildWhatsAppOrderUrl, useCart } from '../cart/CartContext'
import { useContent } from '../content/ContentContext'
import './CartPanel.css'

export default function CartPanel() {
  const { content } = useContent()
  const { items, open, closeCart, removeItem, setQty, count } = useCart()
  const closeRef = useRef(null)
  const panelId = useId()
  const whatsapp = content.contacts.whatsapp
  const orderHref = items.length
    ? buildWhatsAppOrderUrl(whatsapp, items)
    : '#'

  useEffect(() => {
    if (!open) return undefined
    const t = window.setTimeout(() => closeRef.current?.focus(), 40)
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, closeCart])

  return (
    <>
      <button
        type="button"
        className={`cart-backdrop ${open ? 'is-open' : ''}`}
        aria-label="Закрыть корзину"
        tabIndex={open ? 0 : -1}
        onClick={closeCart}
      />
      <aside
        id={panelId}
        className={`cart-panel ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Корзина"
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="cart-panel__head">
          <div className="cart-panel__title-wrap">
            <ShoppingBag strokeWidth={1} size={20} aria-hidden="true" />
            <h2 className="cart-panel__title">Корзина</h2>
            {count > 0 ? (
              <span className="cart-panel__count">{count}</span>
            ) : null}
          </div>
          <button
            type="button"
            className="cart-panel__icon-btn"
            aria-label="Закрыть корзину"
            ref={closeRef}
            onClick={closeCart}
          >
            <X strokeWidth={1} size={24} />
          </button>
        </div>

        <div className="cart-panel__body">
          {items.length === 0 ? (
            <p className="cart-panel__empty">Корзина пока пуста</p>
          ) : (
            <ul className="cart-panel__list">
              {items.map((item) => (
                <li key={item.id} className="cart-panel__item">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="cart-panel__thumb"
                      loading="lazy"
                    />
                  ) : (
                    <div className="cart-panel__thumb cart-panel__thumb--empty" />
                  )}
                  <div className="cart-panel__info">
                    <p className="cart-panel__brand">{item.brand}</p>
                    <p className="cart-panel__name">{item.name}</p>
                    {item.price ? (
                      <p className="cart-panel__price">{item.price}</p>
                    ) : null}
                    <div className="cart-panel__qty">
                      <button
                        type="button"
                        aria-label="Уменьшить количество"
                        onClick={() => setQty(item.id, item.qty - 1)}
                      >
                        <Minus strokeWidth={1.25} size={14} />
                      </button>
                      <span aria-label={`Количество: ${item.qty}`}>
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="Увеличить количество"
                        onClick={() => setQty(item.id, item.qty + 1)}
                      >
                        <Plus strokeWidth={1.25} size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cart-panel__remove"
                      onClick={() => removeItem(item.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cart-panel__foot">
          {items.length > 0 ? (
            <a
              className="cart-panel__order"
              href={orderHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Заказать в WhatsApp
            </a>
          ) : (
            <button
              type="button"
              className="cart-panel__order cart-panel__order--disabled"
              disabled
            >
              Заказать в WhatsApp
            </button>
          )}
          <p className="cart-panel__hint">
            Заявка откроется в WhatsApp с списком выбранных позиций
          </p>
        </div>
      </aside>
    </>
  )
}
