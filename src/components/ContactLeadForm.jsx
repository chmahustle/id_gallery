import { useState } from 'react'
import { buildWhatsAppLeadUrl } from '../catalog/catalog'
import { useContent } from '../content/ContentContext'

const PRESETS = {
  tour: {
    title: 'Запись на персональную экскурсию',
    submit: 'Записаться в WhatsApp',
    thanks: 'Спасибо! Откроется WhatsApp для подтверждения визита.',
    message: (data) =>
      [
        'Здравствуйте! Хочу записаться на персональную экскурсию в ID Gallery.',
        `Имя: ${data.name}`,
        `Телефон: ${data.phone}`,
        data.email ? `E-mail: ${data.email}` : null,
        data.city ? `Город / салон: ${data.city}` : null,
        data.comment ? `Комментарий: ${data.comment}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
  },
  quote: {
    title: 'Запрос коммерческого предложения',
    submit: 'Отправить в WhatsApp',
    thanks: 'Спасибо! Откроется WhatsApp с вашим запросом.',
    message: (data) =>
      [
        'Здравствуйте! Хочу запросить коммерческое предложение.',
        `Имя: ${data.name}`,
        `Телефон: ${data.phone}`,
        data.email ? `E-mail: ${data.email}` : null,
        data.comment ? `Запрос: ${data.comment}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
  },
}

export default function ContactLeadForm({
  type = 'tour',
  cities = [],
  className = '',
}) {
  const { content } = useContent()
  const [sent, setSent] = useState(false)
  const preset = PRESETS[type] || PRESETS.tour

  function onSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const data = {
      name: String(form.get('name') || '').trim(),
      phone: String(form.get('phone') || '').trim(),
      email: String(form.get('email') || '').trim(),
      city: String(form.get('city') || '').trim(),
      comment: String(form.get('comment') || '').trim(),
    }
    const href = buildWhatsAppLeadUrl(
      content.contacts.whatsapp,
      preset.message(data),
    )
    setSent(true)
    if (href && href !== '#') {
      window.open(href, '_blank', 'noopener,noreferrer')
    }
  }

  if (sent) {
    return (
      <p className="form-thanks" role="status">
        {preset.thanks}
      </p>
    )
  }

  return (
    <form className={`contact-form ${className}`.trim()} onSubmit={onSubmit}>
      <p className="contact-form__title">{preset.title}</p>
      <label>
        Имя
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        Телефон
        <input name="phone" type="tel" required autoComplete="tel" />
      </label>
      <label>
        E-mail
        <input name="email" type="email" autoComplete="email" />
      </label>
      {type === 'tour' && cities.length > 0 ? (
        <label>
          Город / салон
          <select name="city" defaultValue="">
            <option value="">Не выбран</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label>
        {type === 'quote' ? 'Что интересует' : 'Комментарий'}
        <textarea name="comment" rows={3} />
      </label>
      <button className="contact-form__submit" type="submit">
        {preset.submit}
      </button>
    </form>
  )
}
