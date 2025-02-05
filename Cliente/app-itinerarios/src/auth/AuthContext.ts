import { User } from '@/types'
import { createContext } from 'react'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  register: (
    name: string,
    username: string,
    email: string,
    password: string,
    avatar: string | null
  ) => Promise<void>
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
