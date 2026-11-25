import { z } from 'zod'

/**
 * Схемы данных админки — общие для сервера (проверка запросов) и сайта
 * (проверка ответов API перед применением). Известные поля проверяются
 * по типу, остальные пропускаются как есть (passthrough), чтобы новые
 * поля карточек не терялись.
 */

const text = (max: number) => z.string().max(max)
const required = (max: number, message: string) =>
  z
    .string({ error: message })
    .max(max)
    .refine((value) => value.trim().length > 0, { message })
const url = text(2000)

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,119}$/
export const CONTENT_ID_RE = /^[a-z0-9][a-z0-9._-]{0,159}$/i
export const MAX_CONTENT_VALUE = 300_000
export const MAX_RECORD_JSON = 300_000

export const slugSchema = z.string().regex(SLUG_RE, 'Адрес: латиница, цифры и дефис')

const variantSchema = z
  .object({
    id: text(160).optional(),
    name: text(300).optional(),
    swatch: url.optional(),
    images: z.array(url).max(60).optional(),
  })
  .passthrough()

/** Товар из админки (тип Product сайта) */
export const productDataSchema = z
  .object({
    name: required(300, 'Укажите название'),
    brandSlug: required(120, 'Укажите бренд'),
    categorySlug: required(120, 'Укажите тип'),
    price: text(100).optional(),
    image: url.optional(),
    images: z.array(url).max(60).optional(),
    variants: z.array(variantSchema).max(100).optional(),
    rooms: z.array(text(120)).max(50).optional(),
    documents: z
      .array(z.object({ title: text(300).optional(), url: url.optional() }).passthrough())
      .max(50)
      .optional(),
  })
  .passthrough()

/** Бренд из админки (тип Brand сайта + подборки) */
export const brandDataSchema = z
  .object({
    name: required(200, 'Укажите название бренда'),
    logo: url.optional(),
    heroImage: url.optional(),
    image: url.optional(),
    website: text(500).optional(),
    featuredSlugs: z.array(text(120)).max(200).optional(),
    interiorSlugs: z.array(text(120)).max(200).optional(),
  })
  .passthrough()

/** Тело запроса сохранения записи: { data, published } */
export const recordBodySchema = <T extends z.ZodType>(data: T) =>
  z.object({ data, published: z.boolean().optional() })

export const contentBodySchema = z.object({
  value: z.string({ error: 'Нужен текст' }).max(MAX_CONTENT_VALUE, 'Слишком длинное значение'),
})

/* ответы API для сайта */
export const contentResponseSchema = z.object({ values: z.record(z.string(), z.string()) })

export const recordItemSchema = z.object({
  slug: z.string().min(1),
  published: z.boolean(),
  data: z.record(z.string(), z.unknown()),
})

/** Первое сообщение об ошибке — для ответа 400 */
export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0]
  return issue?.message && !/^Invalid|^Expected/.test(issue.message)
    ? issue.message
    : `Неверное поле: ${issue?.path.join('.') || 'данные'}`
}

/** Записи из ответа API: неверные отбрасываются по одной, остальные применяются */
export function validRecords(payload: unknown): z.infer<typeof recordItemSchema>[] | null {
  if (!payload || typeof payload !== 'object' || !Array.isArray((payload as { items?: unknown }).items))
    return null
  return (payload as { items: unknown[] }).items.flatMap((item) => {
    const parsed = recordItemSchema.safeParse(item)
    return parsed.success ? [parsed.data] : []
  })
}
