import { API_BASE_URL } from '@/config/config'
import { fetchWithAuth } from './fetchWithAuth'
import { ItineraryListType } from '@/types'

export const itineraryListService = {
  getAll: async (params: {
    userId?: string
    username?: string
    likedBy?: string
    visibility?: 'public' | 'all'
    sort?: string
    limit?: number
  }) => {
    let queryString = '/lists'
    const queryParams = new URLSearchParams()

    if (params.userId) {
      queryParams.append('userId', params.userId)
    }
    if (params.username) {
      queryParams.append('username', params.username)
    }
    if (params.likedBy) {
      queryParams.append('likedBy', params.likedBy)
    }
    if (params.visibility) {
      queryParams.append('visibility', params.visibility)
    }
    if (params.sort) {
      queryParams.append('sort', params.sort)
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString())
    }
    if (queryParams.toString()) {
      queryString += `?${queryParams.toString()}`
    }

    const response = (await Promise.race([
      fetchWithAuth(queryString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 7000))
    ])) as Response

    if (response instanceof Response) {
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error fetching itinerary lists')
      }

      return await response.json()
    }
  },

  getById: async (listId: string) => {
    const response = await fetch(`${API_BASE_URL}/lists/${listId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error fetching itinerary list')
    }
    return await response.json()
  },

  create: async (
    title: string,
    description: string,
    image: string | null,
    isPublic: boolean,
    userId: string
  ) => {
    const response = await fetchWithAuth('/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        image,
        isPublic,
        userId
      })
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error creating itinerary list')
    }

    const locationUrl = response.headers.get('Location')
    if (!locationUrl) {
      throw new Error('Location header is missing in the response')
    }
    const relativePath = new URL(locationUrl).pathname

    return relativePath
  },

  delete: async (listId: string) => {
    const response = await fetchWithAuth(`/lists/${listId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error deleting itinerary list')
    }
  },

  update: async (listId: string, updatedListData: Partial<ItineraryListType>) => {
    const response = await fetchWithAuth(`/lists/${listId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedListData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error updating itinerary list data')
    }
  },

  like: async (listId: string) => {
    const response = await fetchWithAuth(`/lists/${listId}/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error liking itinerary list')
    }
  },

  unlike: async (listId: string) => {
    const response = await fetchWithAuth(`/lists/${listId}/likes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error unliking itinerary list')
    }
  },

  checkIfLiked: async (listId: string) => {
    const response = await fetchWithAuth(`/lists/${listId}/is-liked`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error checking if itinerary list is liked')
    }

    const data = await response.json()
    return data.isLiked
  },

  addItineraryToList: async (listId: string, itineraryId: string) => {
    const response = await fetchWithAuth(`/lists/${listId}/itineraries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itineraryId })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error adding itinerary to list')
    }
  },

  removeItineraryFromList: async (listId: string, itineraryId: string) => {
    const response = await fetchWithAuth(`/lists/${listId}/itineraries`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itineraryId })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error removing itinerary from list')
    }
  }
}
