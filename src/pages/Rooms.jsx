import { useEffect } from 'react'
import SiteShell from '../components/SiteShell'
import { RoomsPage } from '../features/rooms/RoomsPage'

export default function Rooms() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Все комнаты — ID Gallery'
    return () => {
      document.title = 'ID Gallery'
    }
  }, [])

  return (
    <SiteShell variant="solid">
      <RoomsPage />
    </SiteShell>
  )
}
