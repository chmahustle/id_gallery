import { useState } from 'react'
import './Newsletter.css'

export default function Newsletter({
  title = 'Подписка на новости',
  text = 'Анонсы новых коллекций, событий и обновлений шоурумов ID Gallery.',
  placeholder = 'Ваш e-mail',
  button = 'Подписаться',
  thanks = 'Спасибо! Вы подписаны на рассылку.',
}) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  function onSubmit(event) {
    event.preventDefault()
    if (!email.trim()) return
    setDone(true)
  }

  return (
    <section className="newsletter" aria-labelledby="newsletter-title">
      <h2 id="newsletter-title">{title}</h2>
      <p>{text}</p>
      {done ? (
        <p className="newsletter__thanks">{thanks}</p>
      ) : (
        <form className="newsletter__form" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="newsletter-email">
            E-mail
          </label>
          <input
            id="newsletter-email"
            type="email"
            name="email"
            placeholder={placeholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
          <button type="submit">{button}</button>
        </form>
      )}
    </section>
  )
}
