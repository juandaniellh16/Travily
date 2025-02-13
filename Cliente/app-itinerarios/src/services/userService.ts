import { API_BASE_URL } from '@/config/config'

export const userService = {
  getUserData: async (userId: string) => {
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

    const userData = await response.json()
    return {
      id: userData.id,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar,
      followers: userData.followers,
      following: userData.following
    }
  }
}
