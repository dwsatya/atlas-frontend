import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('atlas_user')
    try {
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('atlas_token') || null)

  const login = (userData, userToken = null) => {
    let finalUser = {}
    if (typeof userData === 'string') {
      finalUser = {
        name: userData,
        email: `${userData.toLowerCase().replace(/\s+/g, '')}@atlas.dev`,
      }
    } else if (typeof userData === 'object' && userData !== null) {
      finalUser = { ...userData }
    }

    setUser(finalUser)
    localStorage.setItem('atlas_user', JSON.stringify(finalUser))

    if (userToken) {
      setToken(userToken)
      localStorage.setItem('atlas_token', userToken)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('atlas_user')
    localStorage.removeItem('atlas_token')
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
