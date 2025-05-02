import { ReactNode, useCallback, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'
import { UserPublic } from '@/types'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserPublic | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async (userId?: string) => {
    const id = userId || localStorage.getItem('userId')
    if (!id) return

    try {
      const userData = await userService.getById(id)
      setUser(userData)
      setIsLoading(false)
    } catch {
      setIsLoading(false)
      logout()
    }
  }, [])

  useEffect(() => {
    const userId = localStorage.getItem('userId')

    if (userId) {
      refreshUser(userId)
    } else {
      setIsLoading(false)
    }
  }, [refreshUser])

  const register = async (
    name: string,
    username: string,
    email: string,
    password: string,
    avatar: string | null
  ) => {
    await authService.register(name, username, email, password, avatar)
    await login(username, password)
  }

  const login = async (usernameOrEmail: string, password: string) => {
    const userData = await authService.login(usernameOrEmail, password)
    setUser(userData)
    localStorage.setItem('userId', userData.id)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    localStorage.removeItem('userId')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
