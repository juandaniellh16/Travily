import { UserPublic } from '@/types'
import { createContext } from 'react'

interface AuthContextType {
  user: UserPublic | null
  isLoading: boolean
  isCachedUser: boolean | null
  register: (
    name: string,
    username: string,
    email: string,
    password: string,
    avatar: string | null
  ) => Promise<void>
  login: (usernameOrEmail: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
