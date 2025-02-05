import { ReactNode, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'
import { User } from '@/types'

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('userId')

    if (userId) {
      const fetchUserData = async () => {
        try {
          const userData = await userService.getUserData(userId)
          setUser(userData)
          setIsLoading(false)
        } catch {
          setIsLoading(false)
          logout()
        }
      }

      fetchUserData()
    } else {
      setIsLoading(false)
    }
  }, [])

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

  const login = async (username: string, password: string) => {
    const userData = await authService.login(username, password)
    setUser(userData)
    localStorage.setItem('userId', userData.id)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
    localStorage.removeItem('userId')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
