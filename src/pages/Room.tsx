import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import SiteShell from '../components/SiteShell'
import { RoomPage } from '../features/rooms/RoomPage'
import { getRoomBySlug, getRoomProducts } from '../lib/rooms'

export default function Room() {
  const { roomSlug } = useParams()
  const room = getRoomBySlug(roomSlug || '')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [roomSlug])

  useEffect(() => {
    if (!room) return undefined
    document.title = `${room.label} — ID Gallery`
    return () => {
      document.title = 'ID Gallery'
    }
  }, [room])

  if (!room || getRoomProducts(room.slug).length === 0) {
    return <Navigate to="/rooms/" replace />
  }

  return (
    <SiteShell variant="overlay">
      <RoomPage room={room} />
    </SiteShell>
  )
}
