/**
 * Панель «Варианты исполнения» — только цвета модели из данных товара.
 * Общие библиотеки тканей / сроки поставки удалены (этап 10).
 */

export function flattenFinishes(groups) {
  const list = []
  for (const group of groups) {
    for (const material of group.materials) {
      for (const color of material.colors) {
        list.push({
          ...color,
          material: material.name,
          groupId: group.id,
        })
      }
    }
  }
  return list
}

/** Только группа «Цвета модели»; без «В наличии» / «Под заказ». */
export function getProductFinishGroups(productColors = []) {
  const productList = Array.isArray(productColors) ? productColors : []
  if (!productList.length) return []

  return [
    {
      id: 'model',
      title: 'Цвета модели',
      subtitle: null,
      materials: [
        {
          name: 'Цвета модели',
          colors: productList.map((c) => ({
            id: c.id,
            name: c.name,
            swatch: c.swatch || c.hex || 'var(--color-swatch-fallback)',
            image: c.image,
            status: c.status || 'placeholder',
          })),
        },
      ],
    },
  ]
}

export function countFinishes(groups) {
  return flattenFinishes(groups).length
}
