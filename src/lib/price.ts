/**
 * Цена товара из админки — свободный текст: «1 200 000 ₸», «от 450 000»,
 * «1,2 млн ₸», «по запросу». Для сортировки нужна сумма: первое число
 * в тексте с учётом «тыс» и «млн». Нет числа — суммы нет.
 */
export function parsePriceAmount(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const text = value.toLowerCase().replace(/[\s  ]/g, '')
  const match = text.match(/\d[\d.,]*/)
  if (!match) return null
  let digits = match[0].replace(/[.,]+$/, '')
  /* 1.200.000 или 1,200,000 — разделители тысяч */
  if (/^\d{1,3}([.,]\d{3})+$/.test(digits)) digits = digits.replace(/[.,]/g, '')
  else digits = digits.replace(',', '.')
  const amount = Number(digits)
  if (!Number.isFinite(amount)) return null
  const rest = text.slice((match.index ?? 0) + match[0].length)
  if (rest.startsWith('млн')) return amount * 1_000_000
  if (rest.startsWith('тыс')) return amount * 1_000
  return amount
}

/**
 * Порядок цен без самих цен: 1 — самая низкая. Одинаковые суммы — один номер.
 * Посетителям сайт отдаёт только порядок, чтобы сортировка работала,
 * а цены не были видны, пока их не решат показывать.
 */
export function priceRanks(prices: unknown[]): (number | null)[] {
  const amounts = prices.map(parsePriceAmount)
  const sorted = [...new Set(amounts.filter((n): n is number => n !== null))].sort((a, b) => a - b)
  const rank = new Map(sorted.map((amount, index) => [amount, index + 1]))
  return amounts.map((amount) => (amount === null ? null : rank.get(amount)!))
}
