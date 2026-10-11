import { useEffect, useRef } from 'react'
import './FullBleed.css'

export default function FullBleed({
  poster,
  desktop,
  mobile,
  alt = '',
}) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return undefined

    video.poster = poster || ''

    const mq = window.matchMedia('(min-width: 769px)')
    const applySrc = () => {
      const next = mq.matches ? desktop : mobile
      if (!next || video.dataset.src === next) return
      const wasPlaying = !video.paused
      video.dataset.src = next
      video.src = next
      video.load()
      if (wasPlaying) video.play().catch(() => {})
    }

    applySrc()
    mq.addEventListener('change', applySrc)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches) {
      video.pause()
      return () => mq.removeEventListener('change', applySrc)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      },
      { threshold: 0.35 },
    )

    io.observe(video)
    return () => {
      io.disconnect()
      mq.removeEventListener('change', applySrc)
    }
  }, [desktop, mobile, poster])

  return (
    <figure className="full-bleed">
      <video
        ref={videoRef}
        className="full-bleed__media"
        poster={poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={alt}
      />
    </figure>
  )
}
