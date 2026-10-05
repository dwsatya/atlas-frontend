import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('atlas_user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const login = (username = 'User ATLAS') => {
    const userData = { name: username, email: `${username.toLowerCase().replace(/\s+/g, '')}@atlas.dev` }
    setUser(userData)
    localStorage.setItem('atlas_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('atlas_user')
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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
