/** Демо-вход для показа заказчику: включается вместе с демо-данными (VITE_DEMO_DATA) */
export const demoAuthEnabled = ['true', '1'].includes(
  String(import.meta.env?.VITE_DEMO_DATA ?? ''),
)
