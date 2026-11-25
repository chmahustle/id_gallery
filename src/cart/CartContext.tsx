import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { resolveBrandName } from '../lib/catalog'
import type { Product, ProductVariant } from '../types'

/** Позиция корзины: модель в выбранном исполнении и количество */
export type CartItem = {
  id: string
  name: string
  brand: string
  price: string
  image: string
  variant: string
  qty: number
}

type VariantPick = Pick<ProductVariant, 'id' | 'name'> & { image?: string }

export type CartValue = {
  items: CartItem[]
  open: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (product: Product, variant?: VariantPick | null) => void
  addMissing: (entries: { product: Product; variant?: VariantPick | null }[]) => void
  removeItem: (id: string) => void
  setQty: (id: string, qty: number | string) => void
  clear: () => void
  count: number
}

const STORAGE_KEY = 'id-gallery-cart'
const CartContext = createContext<CartValue | null>(null)

function productId(product: Pick<Product, 'brand' | 'name'>) {
  return `${product.brand}::${product.name}`
}

function loadItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item: CartItem) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.brand === 'string' &&
          Number.isFinite(item.qty) &&
          item.qty > 0,
      )
      .map((item: CartItem) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price || '',
        image: item.image || '',
        variant: typeof item.variant === 'string' ? item.variant : '',
        qty: Math.min(99, Math.max(1, Math.floor(item.qty))),
      }))
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState(loadItems)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore quota */
    }
  }, [items])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const openCart = useCallback(() => setOpen(true), [])
  const closeCart = useCallback(() => setOpen(false), [])
  const toggleCart = useCallback(() => setOpen((v) => !v), [])

  /* variant — выбранное исполнение; одна модель в двух исполнениях — две строки */
  const addItem = useCallback((product: Product, variant: VariantPick | null = null) => {
    const id = variant ? `${productId(product)}::${variant.id}` : productId(product)
    setItems((current) => {
      const existing = current.find((item) => item.id === id)
      if (existing) {
        return current.map((item) =>
          item.id === id ? { ...item, qty: Math.min(99, item.qty + 1) } : item,
        )
      }
      return [
        ...current,
        {
          id,
          name: product.name,
          brand: resolveBrandName(product) || product.brand,
          price: product.price || '',
          image: variant?.image || product.image || '',
          variant: variant?.name || '',
          qty: 1,
        },
      ]
    })
    setOpen(true)
  }, [])

  /* позиции из подборки: добавить отсутствующие, количество не менять, открыть корзину */
  const addMissing = useCallback(
    (entries: { product: Product; variant?: VariantPick | null }[]) => {
      setItems((current) => {
        const next = [...current]
        for (const { product, variant } of entries) {
          const id = variant ? `${productId(product)}::${variant.id}` : productId(product)
          if (next.some((item) => item.id === id)) continue
          next.push({
            id,
            name: product.name,
            brand: resolveBrandName(product) || product.brand,
            price: product.price || '',
            image: variant?.image || product.image || '',
            variant: variant?.name || '',
            qty: 1,
          })
        }
        return next
      })
      setOpen(true)
    },
    [],
  )

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id))
  }, [])

  const setQty = useCallback((id: string, qty: number | string) => {
    const next = Math.floor(Number(qty))
    if (!Number.isFinite(next) || next < 1) {
      setItems((current) => current.filter((item) => item.id !== id))
      return
    }
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, qty: Math.min(99, next) } : item)),
    )
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items])

  const value = useMemo<CartValue>(
    () => ({
      items,
      open,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      addMissing,
      removeItem,
      setQty,
      clear,
      count,
    }),
    [
      addMissing,
      items,
      open,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      setQty,
      clear,
      count,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

/** Нормализация номера для wa.me (8… → 7… для KZ/RU) */
export function normalizeWhatsAppDigits(phone: string | null | undefined) {
  let digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('8') && digits.length === 11) {
    digits = `7${digits.slice(1)}`
  }
  return digits
}

export function buildWhatsAppOrderUrl(phone: string | null | undefined, items: CartItem[]) {
  const digits = normalizeWhatsAppDigits(phone)
  if (!digits) return '#'

  const lines = [
    'Здравствуйте! Хочу оформить заказ в ID Gallery:',
    '',
    ...items.map(
      (item, index) =>
        `${index + 1}. ${item.brand} — ${item.name} × ${item.qty}${
          item.price ? ` (${item.price})` : ''
        }`,
    ),
  ]

  const url = new URL(`https://wa.me/${digits}`)
  url.searchParams.set('text', lines.join('\n'))
  return url.toString()
}
