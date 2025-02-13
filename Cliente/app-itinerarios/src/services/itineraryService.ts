import { API_BASE_URL } from '@/config/config'
import { fetchWithAuth } from './fetchWithAuth'

export const itineraryService = {
  getAll: async (params: {
    location?: string
    userId?: string
    likedBy?: string
    sort?: string
  }) => {
    let queryString = `${API_BASE_URL}/itineraries`
    const queryParams = new URLSearchParams()

    if (params.location) {
      queryParams.append('location', params.location)
    }
    if (params.userId) {
      queryParams.append('userId', params.userId)
    }
    if (params.likedBy) {
      queryParams.append('likedBy', params.likedBy)
    }
    if (params.sort) {
      queryParams.append('sort', params.sort)
    }
    if (queryParams.toString()) {
      queryString += `?${queryParams.toString()}`
    }

    const response = await fetch(queryString)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error fetching itineraries')
    }

    return await response.json()
  },

  getById: async (itineraryId: string) => {
    const response = await fetch(`${API_BASE_URL}/itineraries/${itineraryId}`)
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
    locations: string[],
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
        locations,
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

  /*
  update: async (itineraryId: string) => {
    const response = await fetchWithAuth(`/itineraries/${itineraryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      throw new Error('Error updating itinerary')
    }
  },
  */

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
  }

  /*
  addEvent: async (itineraryId: string, dayId: string, event: Event) => {
    const response = await fetchWithAuth(
      `/itineraries/${itineraryId}/days/${dayId}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event })
      }
    )

    if (!response.ok) {
      throw new Error('Error adding event')
    }

    return response.json()
  },

  deleteEvent: async (itineraryId: string, dayId: string, eventId: string) => {
    try {
      const response = await fetchWithAuth(
        `/itineraries/${itineraryId}/days/${dayId}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      )

      if (!response.ok) {
        throw new Error('Error deleting event')
      }

      return response.json()
    } catch {
      throw new Error('Error deleting event')
    }
  },

  updateEventOrder: async (
    itineraryId: string,
    dayId: string,
    reorderedEvents: Event[]
  ) => {
    try {
      const response = await fetchWithAuth(
        `/itineraries/${itineraryId}/events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ dayId, reorderedEvents })
        }
      )

      if (!response.ok) {
        throw new Error('Error updating event order')
      }
    } catch {
      throw new Error('Error updating event order')
    }
  }
  */
}
