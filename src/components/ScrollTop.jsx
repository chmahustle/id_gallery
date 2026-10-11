import { ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import './ScrollTop.css'

export default function ScrollTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      className={`scroll-top ${visible ? 'is-visible' : ''}`}
      aria-label="Наверх"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <ChevronUp strokeWidth={1.25} size={22} />
    </button>
  )
}
