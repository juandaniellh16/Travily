import { fetchWithAuth } from './fetchWithAuth'
import { ItineraryType, LocationType } from '@/types'

export const itineraryService = {
  getAll: async (params: {
    location?: string
    userId?: string
    username?: string
    role?: string
    likedBy?: string
    followedBy?: string
    visibility?: 'public' | 'all'
    sort?: string
    limit?: number
  }) => {
    let queryString = '/itineraries'
    const queryParams = new URLSearchParams()

    if (params.location) {
      queryParams.append('location', params.location)
    }
    if (params.userId) {
      queryParams.append('userId', params.userId)
    }
    if (params.username) {
      queryParams.append('username', params.username)
    }
    if (params.role) {
      queryParams.append('role', params.role)
    }
    if (params.likedBy) {
      queryParams.append('likedBy', params.likedBy)
    }
    if (params.followedBy) {
      queryParams.append('followedBy', params.followedBy)
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
        throw new Error(errorData.error || 'Error fetching itineraries')
      }

      return await response.json()
    }
  },

  getById: async (itineraryId: string) => {
    const response = await fetch(`/api/itineraries/${itineraryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error fetching itinerary')
    }
    return await response.json()
  },

  create: async (
    title: string,
    description: string,
    image: string | null,
    startDate: string,
    endDate: string,
    location: LocationType,
    isPublic: boolean,
    userId: string
  ) => {
    const response = await fetchWithAuth('/itineraries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        image,
        startDate,
        endDate,
        location,
        isPublic,
        userId
      })
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error creating itinerary')
    }

    const locationUrl = response.headers.get('Location')
    if (!locationUrl) {
      throw new Error('Location header is missing in the response')
    }
    const relativePath = new URL(locationUrl).pathname

    return relativePath
  },

  delete: async (itineraryId: string) => {
    const response = await fetchWithAuth(`/itineraries/${itineraryId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error deleting itinerary')
    }
  },

  update: async (itineraryId: string, updatedItineraryData: Partial<ItineraryType>) => {
    const response = await fetchWithAuth(`/itineraries/${itineraryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItineraryData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error updating itinerary data')
    }
  },

  like: async (itineraryId: string) => {
    const response = await fetchWithAuth(`/itineraries/${itineraryId}/likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error liking itinerary')
    }
  },

  unlike: async (itineraryId: string) => {
    const response = await fetchWithAuth(`/itineraries/${itineraryId}/likes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error unliking itinerary')
    }
  },

  checkIfLiked: async (itineraryId: string) => {
    const response = await fetchWithAuth(`/itineraries/${itineraryId}/is-liked`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error checking if itinerary is liked')
    }

    const data = await response.json()
    return data.isLiked
  },

  addCollaborator: async (itineraryId: string, username: string) => {
    const response = await fetchWithAuth(`/itineraries/${itineraryId}/collaborators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error adding collaborator')
    }
  },

  getCollaborators: async (itineraryId: string) => {
    const response = await fetchWithAuth(`/itineraries/${itineraryId}/collaborators`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error getting collaborators')
    }

    return await response.json()
  },

  checkIfCollaborator: async (itineraryId: string) => {
    const response = await fetchWithAuth(`/itineraries/${itineraryId}/is-collaborator`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error checking if user is collaborator')
    }

    const data = await response.json()
    return data.isCollaborator
  }
}
