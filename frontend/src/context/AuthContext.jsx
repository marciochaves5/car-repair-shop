import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setUnauthorizedHandler } from '../api/client.js'
import { Auth } from '../api/resources.js'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

const TOKEN_KEY = 'oficina.token'
const EMAIL_KEY = 'oficina.email'

function decodeExp(token) {
  try {
    let b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4) b64 += '='
    const payload = JSON.parse(atob(b64))
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY))

  const logout = useMemo(
    () => () => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(EMAIL_KEY)
      setToken(null)
      setEmail(null)
      navigate('/login', { replace: true })
    },
    [navigate],
  )

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  // Expire the session client-side when the JWT lapses.
  useEffect(() => {
    if (!token) return
    const exp = decodeExp(token)
    if (!exp) return
    const ms = exp - Date.now()
    if (ms <= 0) {
      logout()
      return
    }
    const id = setTimeout(logout, ms)
    return () => clearTimeout(id)
  }, [token, logout])

  function persist({ token: t, email: e }) {
    localStorage.setItem(TOKEN_KEY, t)
    localStorage.setItem(EMAIL_KEY, e)
    setToken(t)
    setEmail(e)
  }

  async function login(creds) {
    const data = await Auth.login(creds)
    persist(data)
  }

  async function register(creds) {
    const data = await Auth.register(creds)
    persist(data)
  }

  return (
    <AuthCtx.Provider value={{ token, email, isAuthed: !!token, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}
