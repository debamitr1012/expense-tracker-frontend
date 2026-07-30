import { createContext, useContext, useState } from 'react'
import { googleLogout } from '@react-oauth/google'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })

  const persist = (data) => {
    localStorage.setItem('token', data.token)
    const u = { name: data.name, username: data.username }
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
  }

  const loginWithGoogle = async (credential) => {
    const { data } = await api.post('/auth/google', { credential })
    persist(data)
  }

  const logout = () => {
    googleLogout()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
