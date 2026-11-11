import type { Product } from '../types'

/**
 * Каталог товаров. Реальные позиции добавлять в `baseProducts`.
 * Демонстрационные товары лежат в demoProducts.ts и подключаются только при
 * VITE_DEMO_DATA=true; если файл удалить, сайт продолжит работать без них.
 */
const baseProducts: Product[] = []

const demoEnabled = ['true', '1'].includes(
  String(import.meta.env?.VITE_DEMO_DATA ?? ''),
)

/* glob: если demoProducts.ts удалён — пусто; в Node-скриптах (без Vite) — тоже */
let demoModules: Record<string, { demoProducts: Product[] }> = {}
try {
  demoModules = import.meta.glob<{ demoProducts: Product[] }>(
    './demoProducts.ts',
    { eager: true },
  )
} catch {
  demoModules = {}
}
const demoProducts: Product[] = demoEnabled
  ? Object.values(demoModules).flatMap((mod) => mod.demoProducts)
  : []

export const products: Product[] = [...baseProducts, ...demoProducts]
