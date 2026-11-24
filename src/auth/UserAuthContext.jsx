import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api } from '../api'
import { demoAuthEnabled } from './demoAuth'

const UserAuthContext = createContext(null)

/*
 * Демо-вход для показа заказчику (VITE_DEMO_DATA): без сервера, в рамках сессии.
 * Имён не выдумываем — «ФИО».
 */
const DEMO_USER_KEY = 'idg-demo-user'

function readDemoUser() {
  if (!demoAuthEnabled) return null
  try {
    return JSON.parse(sessionStorage.getItem(DEMO_USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await api('/api/account/me')
        if (!cancelled) setUser(data.user || readDemoUser())
      } catch {
        if (!cancelled) setUser(readDemoUser())
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const data = await api('/api/account/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    const data = await api('/api/account/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    setUser(data.user)
    return data.user
  }, [])

  const demoLogin = useCallback((email = '') => {
    const demoUser = { name: 'ФИО', email, demo: true }
    try {
      sessionStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser))
    } catch {
      /* sessionStorage недоступен — вход до перезагрузки */
    }
    setUser(demoUser)
    return demoUser
  }, [])

  const logout = useCallback(async () => {
    try {
      sessionStorage.removeItem(DEMO_USER_KEY)
    } catch {
      /* ignore */
    }
    try {
      await api('/api/account/logout', { method: 'POST' })
    } catch {
      /* демо без сервера */
    }
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      demoLogin,
    }),
    [user, ready, login, register, logout, demoLogin],
  )

  return (
    <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>
  )
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext)
  if (!ctx) {
    throw new Error('useUserAuth must be used within UserAuthProvider')
  }
  return ctx
}
