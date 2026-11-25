import { type FormEvent, useEffect, useId, useMemo, useState } from 'react'
import { buildWhatsAppLeadUrl, productPath } from '../../catalog/catalog'
import { useCart } from '../../cart/CartContext'
import CatalogSelect from '../../components/catalog/CatalogSelect'
import { Button, SectionLabel } from '../../components/ui'
import { useContent } from '../../content/ContentContext'
import { featureFlags } from '../../data/featureFlags'
import {
  consultationCopy as copy,
  keepDirections,
  type ServiceAudience,
  serviceDirectionsCopy,
  todayISODate,
} from '../../data/request-page'
import { products } from '../../data/products'
import { isVerifiedShowroom, showrooms } from '../../data/showrooms'
import { resolveBrandName } from '../../lib/catalog'
import { RequestField } from './RequestField'
import { ServiceDirections } from './ServiceDirections'

type Format = 'showroom' | 'online'

type Draft = {
  format: Format
  showroom: string
  date: string
  time: string
  name: string
  contact: string
  audience: ServiceAudience
  directions: string[]
  comment: string
}

/** brand и name отдельно — для текста сообщения; href — ссылка на модель */
type Item = { key: string; brand: string; name: string; variant: string; qty: number; href: string }

const DRAFT_KEY = 'idg-consultation-draft'

const EMPTY: Draft = {
  format: 'showroom',
  showroom: '',
  date: '',
  time: '',
  name: '',
  contact: '',
  audience: 'private',
  directions: [],
  comment: '',
}

/* поля переживают ошибку, переход и возврат: черновик в рамках вкладки */
function loadDraft(): Draft {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}')
    return {
      ...EMPTY,
      ...parsed,
      format: parsed.format === 'online' ? 'online' : 'showroom',
      audience: parsed.audience === 'pro' ? 'pro' : 'private',
      directions: Array.isArray(parsed.directions)
        ? parsed.directions.filter((item: unknown) => typeof item === 'string')
        : [],
    }
  } catch {
    return EMPTY
  }
}

function formatDate(iso: string) {
  if (!iso) return ''
  const date = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

/** «Подбор мебели, Освещение» → «подбор мебели, освещение» */
function joinPhrases(list: string[]) {
  return list.map((item) => item.charAt(0).toLowerCase() + item.slice(1)).join(', ')
}

type Props = {
  modelSlugs: string[]
  variantIds: string[]
  initialShowroom: string
  /** ?audience=pro — со страницы «Для профессионалов» */
  initialAudience?: ServiceAudience | null
}

/** /request/?type=visit — запись на консультацию: шоурум или онлайн */
export function RequestConsultation({
  modelSlugs,
  variantIds,
  initialShowroom,
  initialAudience,
}: Props) {
  const baseId = useId()
  const { content } = useContent()
  const { items: cartItems } = useCart()

  const showroomOptions = useMemo(
    () =>
      showrooms
        .filter((item) => isVerifiedShowroom(item) || featureFlags.showShowroomPlaceholders)
        .map((item) => ({
          value: item.slug,
          label: `${item.name} · ${item.city}`,
        })),
    [],
  )

  const [draft, setDraft] = useState<Draft>(() => {
    const loaded = loadDraft()
    const saved = initialAudience
      ? {
          ...loaded,
          audience: initialAudience,
          directions: keepDirections(initialAudience, loaded.directions),
        }
      : loaded
    /* шоурум из ссылки важнее черновика */
    return initialShowroom ? { ...saved, format: 'showroom', showroom: initialShowroom } : saved
  })
  const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({})
  const [preview, setPreview] = useState(false)
  const [opened, setOpened] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
      /* ignore */
    }
  }, [draft])

  useEffect(() => {
    /* в конструкторе админки заголовок вкладки не трогаем */
    if (window.location.pathname.startsWith('/admin')) return
    document.title = `${copy.title} — ID Gallery`
  }, [])

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
    setPreview(false)
  }

  /* предметы: корзина (с количеством) и модели из ссылки; корзина не очищается */
  const items = useMemo<Item[]>(() => {
    const hrefFor = (brand: string, name: string) => {
      const product = products.find(
        (item) => item.name === name && (resolveBrandName(item) || item.brand) === brand,
      )
      return product ? productPath(product.slug) : ''
    }
    const list: Item[] = cartItems.map(
      (item: { id: string; brand: string; name: string; variant: string; qty: number }) => ({
        key: item.id,
        brand: item.brand,
        name: item.name,
        variant: item.variant,
        qty: item.qty,
        href: hrefFor(item.brand, item.name),
      }),
    )
    modelSlugs.forEach((slug, index) => {
      const product = products.find((item) => item.slug === slug)
      if (!product) return
      const brand = resolveBrandName(product) || product.brand
      if (list.some((item) => item.brand === brand && item.name === product.name)) return
      const finishes = [...(product.colors || []), ...(product.variants || [])]
      const variant = finishes.find((item) => item.id === variantIds[index])
      list.push({
        key: `url-${slug}`,
        brand,
        name: product.name,
        variant: variant?.name || '',
        qty: 0,
        href: productPath(slug),
      })
    })
    return list
  }, [cartItems, modelSlugs, variantIds])

  const showroomLabel = showroomOptions.find((item) => item.value === draft.showroom)?.label || ''

  const itemDetail = (item: Item) =>
    [item.variant || copy.variantPending, item.qty ? `${item.qty} шт.` : ''].filter(Boolean)

  /* сообщение обычными фразами; ссылки на модели добавляются только при отправке */
  function buildMessage(withLinks: boolean) {
    const when = [
      draft.format === 'showroom'
        ? `в шоуруме${showroomLabel ? ` ${showroomLabel}` : ''}`
        : 'онлайн',
      formatDate(draft.date),
      draft.time ? `в ${draft.time} по Алматы` : '',
    ]
      .filter(Boolean)
      .join(' ')
    const blocks = [
      copy.messageHello,
      draft.directions.length
        ? `${serviceDirectionsCopy.messagePrefix}: ${joinPhrases(draft.directions)}.`
        : '',
      ...items.map((item) =>
        [
          `Интересует ${item.brand}, ${item.name}.`,
          `${itemDetail(item).join(', ')}.`,
          withLinks && item.href ? `${window.location.origin}${item.href}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      ),
      `Предпочтительна консультация ${when}.`,
      [draft.name.trim(), draft.contact.trim()].filter(Boolean).join('\n'),
      draft.comment.trim() ? `Комментарий: ${draft.comment.trim()}` : '',
    ]
    return blocks.filter(Boolean).join('\n\n')
  }

  const message = buildMessage(false)
  const sendMessage = buildMessage(true)
  const hasLinks = items.some((item) => item.href)

  const whatsappHref = buildWhatsAppLeadUrl(content.contacts.whatsapp, sendMessage)
  const hasWhatsApp = Boolean(whatsappHref && whatsappHref !== '#')
  /* только проверенные контакты: номер с цифрами, адрес с @; заглушки «[Телефон]» не ссылки */
  const phone = content.contacts.phone || ''
  const phoneDigits = phone.replace(/[^\d+]/g, '')
  const phoneHref = /\d{5,}/.test(phoneDigits) ? `tel:${phoneDigits}` : ''
  const email = String(content.contacts.email || '').trim()
  const mailHref = /^[^\s@[\]]+@[^\s@]+$/.test(email)
    ? `mailto:${email}?subject=${encodeURIComponent(copy.title)}&body=${encodeURIComponent(sendMessage)}`
    : ''
  /* демо: кнопки видны и без контактов, ссылка ведёт в никуда */
  const altDemo = featureFlags.showContactPlaceholders

  function onCheck(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Partial<Record<keyof Draft, string>> = {}
    if (!draft.contact.trim()) next.contact = copy.errorContact
    if (draft.date && draft.date < todayISODate()) next.date = copy.errorDatePast
    setErrors(next)
    if (Object.keys(next).length > 0) return
    setPreview(true)
    setOpened(false)
    setCopied(false)
    window.scrollTo(0, 0)
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(sendMessage)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  function backToForm() {
    setPreview(false)
    window.scrollTo(0, 0)
  }

  /* экран проверки: текст слева, другой способ связи справа */
  if (preview) {
    const hasAlt = Boolean(phoneHref || mailHref || altDemo)
    return (
      <section className="request-consult" aria-labelledby={`${baseId}-title`}>
        <h1 id={`${baseId}-title`} className="request-page__title">
          {copy.previewTitle}
        </h1>
        <div className="request-consult__check-grid">
          <div className="request-consult__panel request-consult__review">
            <div className="request-consult__message">
              {message.split('\n\n').map((block, index) => (
                <p key={index}>{block}</p>
              ))}
            </div>
            {hasLinks ? <p className="request-consult__note">{copy.linkNote}</p> : null}
            <div className="request-consult__actions">
              {hasWhatsApp ? (
                <Button
                  as="a"
                  variant="primary"
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  fullWidthMobile
                  onClick={() => setOpened(true)}
                >
                  {copy.openWhatsApp}
                </Button>
              ) : null}
              <Button type="button" variant="secondary" fullWidthMobile onClick={copyText}>
                {copied ? copy.copied : copy.copyText}
              </Button>
            </div>
            <button type="button" className="request-consult__textbtn" onClick={backToForm}>
              {copy.editData}
            </button>
          </div>

          <div className="request-consult__alt">
            {hasAlt ? (
              <section aria-labelledby={`${baseId}-alt`}>
                <SectionLabel id={`${baseId}-alt`}>{copy.altTitle}</SectionLabel>
                <p className="request-consult__lead">{copy.altLead}</p>
                <div className="request-consult__actions">
                  {phoneHref || altDemo ? (
                    <Button
                      as="a"
                      variant="secondary"
                      href={phoneHref || '#'}
                      aria-label={phoneHref ? `${copy.call} ${phone}` : undefined}
                      onClick={(event) => {
                        if (!phoneHref) event.preventDefault()
                      }}
                    >
                      {copy.call}
                    </Button>
                  ) : null}
                  {mailHref || altDemo ? (
                    <Button
                      as="a"
                      variant="secondary"
                      href={mailHref || '#'}
                      onClick={(event) => {
                        if (!mailHref) event.preventDefault()
                      }}
                    >
                      {copy.email}
                    </Button>
                  ) : null}
                </div>
                <p className="request-consult__note">{copy.altNote}</p>
              </section>
            ) : null}
            {opened ? (
              <p className="request-consult__reminder" role="status">
                {copy.sentNote}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    )
  }

  const formatIds = {
    showroom: `${baseId}-f-showroom`,
    online: `${baseId}-f-online`,
  }

  return (
    <section className="request-consult" aria-labelledby={`${baseId}-title`}>
      <h1 id={`${baseId}-title`} className="request-page__title">
        {copy.title}
      </h1>

      <div className="request-consult__panel">
        <div className="request-consult__format" role="radiogroup" aria-label={copy.formatLabel}>
          {(['showroom', 'online'] as Format[]).map((format) => (
            <button
              key={format}
              id={formatIds[format]}
              type="button"
              role="radio"
              aria-checked={draft.format === format}
              className={['request-page__tab', draft.format === format ? 'is-active' : ''].join(
                ' ',
              )}
              onClick={() => set('format', format)}
            >
              {format === 'showroom' ? copy.formatShowroom : copy.formatOnline}
            </button>
          ))}
        </div>

        <form className="request-consult__form" onSubmit={onCheck} noValidate>
          {draft.format === 'showroom' && showroomOptions.length ? (
            <CatalogSelect
              className="request-consult__select"
              label={copy.fieldShowroom}
              placeholder={copy.showroomPlaceholder}
              value={draft.showroom}
              options={showroomOptions}
              onChange={(showroom: string) => set('showroom', showroom)}
            />
          ) : null}

          <div className="request-consult__pair">
            <RequestField
              id={`${baseId}-date`}
              label={copy.fieldDate}
              name="date"
              type="date"
              min={todayISODate()}
              value={draft.date}
              error={errors.date}
              onChange={(date) => set('date', date)}
            />
            <RequestField
              id={`${baseId}-time`}
              label={copy.fieldTime}
              name="time"
              type="time"
              value={draft.time}
              onChange={(time) => set('time', time)}
            />
          </div>
          <p className="request-consult__note">{copy.confirmNote}</p>

          <div className="request-consult__pair">
            <RequestField
              id={`${baseId}-name`}
              label={copy.fieldName}
              name="name"
              autoComplete="name"
              value={draft.name}
              onChange={(name) => set('name', name)}
            />
            <RequestField
              id={`${baseId}-contact`}
              label={copy.fieldContact}
              name="contact"
              autoComplete="tel"
              value={draft.contact}
              error={errors.contact}
              onChange={(contact) => set('contact', contact)}
            />
          </div>

          <ServiceDirections
            audience={draft.audience}
            value={draft.directions}
            onChange={(directions) => set('directions', directions)}
            onAudienceChange={(audience) =>
              setDraft((current) => ({
                ...current,
                audience,
                directions: keepDirections(audience, current.directions),
              }))
            }
          />

          {items.length ? (
            <div className="request-consult__items">
              <h2 className="request-consult__subtitle">{copy.itemsTitle}</h2>
              <ul>
                {items.map((item) => (
                  <li key={item.key}>
                    <span>{`${item.brand}, ${item.name}`}</span>
                    <span>{itemDetail(item).join(' · ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <RequestField
            id={`${baseId}-comment`}
            label={copy.fieldComment}
            name="comment"
            value={draft.comment}
            onChange={(comment) => set('comment', comment)}
          />

          <div className="request-consult__actions">
            <Button type="submit" variant="primary" fullWidthMobile>
              {copy.check}
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
