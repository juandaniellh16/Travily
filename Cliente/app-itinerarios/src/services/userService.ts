import { API_BASE_URL } from '@/config/config'
import { fetchWithAuth } from './fetchWithAuth'

export const userService = {
  getById: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch user data')
    }

    return await response.json()
  },

  getByUsername: async (username: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${username}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch user data')
    }

    return await response.json()
  },

  followUser: async (userId: string) => {
    const response = await fetchWithAuth(`/users/${userId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error following user')
    }
  },

  unfollowUser: async (userId: string) => {
    const response = await fetchWithAuth(`/users/${userId}/follow`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error unfollowing user')
    }
  },

  checkIfFollowing: async (userId: string) => {
    const response = await fetchWithAuth(`/users/${userId}/is-following`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error checking if following user')
    }

    const data = await response.json()
    return data.isFollowing
  },

  getFollowers: async (userId: string) => {
    const response = await fetchWithAuth(`/users/${userId}/followers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch followers')
    }

    return await response.json()
  },

  getFollowing: async (userId: string) => {
    const response = await fetchWithAuth(`/users/${userId}/following`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch following')
    }

    return await response.json()
  }
}
