import { API_BASE_URL } from '@/config/config'

export const itineraryService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/itineraries`)
    if (!response.ok) {
      throw new Error('Error fetching itineraries')
    }
    return await response.json()
  },

  getById: async (itineraryId: string) => {
    const response = await fetch(`${API_BASE_URL}/itineraries/${itineraryId}`)
    if (!response.ok) {
      throw new Error('Error fetching itinerary')
    }
    return await response.json()
  },

  getPopularItineraries: async () => {
    const response = await fetch(`${API_BASE_URL}/itineraries/popular`)
    if (!response.ok) {
      throw new Error('Error fetching popular itineraries')
    }
    return await response.json()
  },

  getUserItineraries: async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/itineraries/user/${userId}`)
    if (!response.ok) {
      throw new Error('Error fetching user itineraries')
    }
    return await response.json()
  },

  getUserLikedItineraries: async (userId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/itineraries/user/${userId}/liked`
    )
    if (!response.ok) {
      throw new Error('Error fetching user liked itineraries')
    }
    return await response.json()
  },

  create: async (
    title: string,
    description: string,
    image: string | null,
    startDate: string,
    endDate: string,
    locations: string[],
    userId: string
  ) => {
    const response = await fetch(`${API_BASE_URL}/itineraries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title,
        description,
        image,
        startDate,
        endDate,
        locations,
        userId
      })
    })
    if (!response.ok) {
      throw new Error('Error creating itinerary')
    }
    return await response.json()
  },

  like: async (itineraryId: string, userId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/itineraries/${itineraryId}/like`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      }
    )

    if (!response.ok) {
      throw new Error('Like error')
    }
  },

  unlike: async (itineraryId: string, userId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/itineraries/${itineraryId}/unlike`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      }
    )

    if (!response.ok) {
      throw new Error('Unlike error')
    }
  }
}
