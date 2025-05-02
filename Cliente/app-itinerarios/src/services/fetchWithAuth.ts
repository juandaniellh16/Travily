import { API_BASE_URL } from '@/config/config'
import { authService } from './authService'

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    credentials: 'include'
  })

  if (response.status === 401) {
    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include'
    })

    if (!refreshResponse.ok) {
      window.location.replace('/login')
      await authService.logout()
      localStorage.removeItem('userId')
      throw new Error('Refresh token error')
    }

    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      credentials: 'include'
    })
  }

  return response
}
