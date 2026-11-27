import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { podbor } from '../data/services'
import { PodborPage } from '../features/services/PodborPage'

/** /services/podbor — «Подбор и комплектация» */
export default function ServicesPodbor() {
  useEffect(() => {
    document.title = `${podbor.title} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  const { hash } = useLocation()

  useEffect(() => {
    /*
     * Якорь из меню (#etapy, #obsudit): при открытии меню прокрутка страницы
     * заблокирована, поэтому ждём, пока меню закроется, и только потом
     * прокручиваем к секции; без якоря — вверх.
     */
    const id = hash.slice(1)
    if (!id) {
      window.scrollTo(0, 0)
      return undefined
    }
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView()
    }, 150)
    return () => window.clearTimeout(timer)
  }, [hash])

  return (
    <SiteShell variant="overlay">
      <PodborPage />
    </SiteShell>
  )
}
