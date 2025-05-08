import { authService } from './authService'

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(`/api/${url}`, {
    ...options,
    credentials: 'include'
  })

  if (response.status === 401) {
    const refreshResponse = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      credentials: 'include'
    })

    if (!refreshResponse.ok) {
      window.location.replace('/login')
      await authService.logout()
      localStorage.removeItem('userId')
      throw new Error('Refresh token error')
    }

    return fetch(`/api/${url}`, {
      ...options,
      credentials: 'include'
    })
  }

  return response
}
