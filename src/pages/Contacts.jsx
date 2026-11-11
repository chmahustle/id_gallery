import { Navigate, useLocation } from 'react-router-dom'

/** Старый путь → канонический /contact/ (query сохраняем) */
export default function Contacts() {
  const { search } = useLocation()
  return <Navigate to={`/contact${search}`} replace />
}
