import { API_BASE_URL } from '@/config/config'
import { fetchWithAuth } from './fetchWithAuth'
import { UserUpdate } from '@/types'

export const userService = {
  getAll: async (params: {
    name?: string
    username?: string
    limit?: number
  }) => {
    let queryString = `${API_BASE_URL}/users`
    const queryParams = new URLSearchParams()

    if (params.name) {
      queryParams.append('name', params.name)
    }
    if (params.username) {
      queryParams.append('username', params.username)
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (queryParams.toString()) {
      queryString += `?${queryParams.toString()}`
    }

    const response = (await Promise.race([
      fetch(queryString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 7000)
      )
    ])) as Response

    if (response instanceof Response) {
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error fetching users')
      }

      return await response.json()
    }
  },

  getSuggestedUsers: async (params: { limit?: number }) => {
    let queryString = '/users/suggested'
    const queryParams = new URLSearchParams()

    if (params.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (queryParams.toString()) {
      queryString += `?${queryParams.toString()}`
    }
    const response = await fetchWithAuth(queryString, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error fetching suggested users')
    }

    return await response.json()
  },

  getById: async (userId: string, includeEmail = false) => {
    const response = await fetchWithAuth(
      `/users/${userId}?includeEmail=${includeEmail}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch user data')
    }

    return await response.json()
  },

  getByUsername: async (username: string, includeEmail = false) => {
    const response = await fetchWithAuth(
      `/users/${username}?includeEmail=${includeEmail}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to fetch user data')
    }

    return await response.json()
  },

  update: async (userId: string, updatedUserData: UserUpdate) => {
    const response = await fetchWithAuth(`/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUserData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error updating user data')
    }
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
