import { useId, useState } from 'react'
import './Newsletter.css'
import { Button } from './ui'

/**
 * Форма рассылки. В футере / на страницах — только при
 * featureFlags.showNewsletter === true (в документе блока нет).
 */
export default function NewsletterForm({
  title = 'Подписаться на рассылку',
  text,
  placeholder = 'Email',
  button = 'Подписаться →',
  thanks = 'Спасибо! Вы подписаны.',
  className,
  headingClassName,
}) {
  const emailId = useId()
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  function onSubmit(event) {
    event.preventDefault()
    if (!email.trim()) return
    setDone(true)
  }

  const wrapClass = className || 'newsletter'
  const isFooter = Boolean(headingClassName)

  return (
    <div className={wrapClass}>
      {title ? (
        <h2
          className={headingClassName || undefined}
          id={isFooter ? undefined : 'newsletter-title'}
        >
          {title}
        </h2>
      ) : null}
      {text ? <p>{text}</p> : null}
      {done ? (
        <p
          className={
            isFooter
              ? 'footer__subscribe-thanks'
              : 'newsletter__thanks'
          }
        >
          {thanks}
        </p>
      ) : (
        <form
          className={isFooter ? 'footer__subscribe' : 'newsletter__form'}
          onSubmit={onSubmit}
        >
          <label className="sr-only" htmlFor={emailId}>
            Email
          </label>
          <input
            id={emailId}
            className={isFooter ? 'footer__subscribe-input' : undefined}
            type="email"
            name="email"
            placeholder={placeholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
          <Button
            type="submit"
            variant="primary"
          >
            {button}
          </Button>
        </form>
      )}
    </div>
  )
}
