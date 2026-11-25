/* адреса страниц из русских названий: «Кресло Нуар» → kreslo-nuar */
const TRANSLIT: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

/**
 * Адрес латиницей из названия. max — длина адреса; amp — «&» как «-and-»
 * (у брендов: «B&B Italia» → b-and-b-italia).
 */
export function slugify(text: unknown, { max = 60, amp = false } = {}): string {
  let value = String(text || '')
    .toLowerCase()
    .split('')
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
  if (amp) value = value.replace(/&/g, '-and-')
  return value
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max)
}
