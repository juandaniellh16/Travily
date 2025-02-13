import { API_BASE_URL } from '@/config/config'

export const authService = {
  register: async (
    name: string,
    username: string,
    email: string,
    password: string,
    avatar: string | null
  ) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password, avatar })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Register error')
    }
  },

  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Login error')
    }

    return await response.json()
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Logout error')
    }
  }
}
