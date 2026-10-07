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

  const [token, setToken] = useState(() => {
    return localStorage.getItem('atlas_token') || null
  })

  const login = (userOrUsername = 'User ATLAS', authToken = null) => {
    let userData
    if (typeof userOrUsername === 'string') {
      userData = {
        name: userOrUsername,
        email: `${userOrUsername.toLowerCase().replace(/\s+/g, '')}@atlas.dev`,
      }
    } else {
      userData = userOrUsername
    }

    setUser(userData)
    localStorage.setItem('atlas_user', JSON.stringify(userData))

    if (authToken) {
      setToken(authToken)
      localStorage.setItem('atlas_token', authToken)
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
