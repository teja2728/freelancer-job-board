import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(false)

  // Init from storage
  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored)
        setUser(user)
        setToken(token)
      } catch {}
    }
    const storedDark = localStorage.getItem('theme')
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const enableDark = storedDark ? storedDark === 'dark' : prefersDark
    setDark(enableDark)
    document.documentElement.classList.toggle('dark', enableDark)
    setLoading(false)
  }, [])

  const saveAuth = (payload) => {
    localStorage.setItem('auth', JSON.stringify(payload))
    setUser(payload.user)
    setToken(payload.token)
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    saveAuth({ user: { _id: data._id, name: data.name, email: data.email, role: data.role }, token: data.token })
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    saveAuth({ user: { _id: data._id, name: data.name, email: data.email, role: data.role }, token: data.token })
    return data
  }

  const logout = () => {
    localStorage.removeItem('auth')
    setUser(null)
    setToken(null)
  }

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const value = useMemo(() => ({ user, token, loading, login, register, logout, dark, toggleDark }), [user, token, loading, dark])
  return React.createElement(AuthContext.Provider, { value }, children)
}
