import { API_BASE_URL } from '@/config/config'

export const searchService = {
  getLocationSuggestions: async ({ query, lang }: { query: string; lang?: string }) => {
    const detectedLang = lang || navigator.language?.split('-')[0] || 'es'

    const response = await fetch(
      `${API_BASE_URL}/search/locations?query=${query}&lang=${detectedLang}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error fetching location suggestions')
    }

    return await response.json()
  },

  getUserSuggestions: async ({ query }: { query: string }) => {
    const response = await fetch(`${API_BASE_URL}/search/users?query=${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error fetching user suggestions')
    }

    return await response.json()
  },

  getSuggestions: async ({ query, lang }: { query: string; lang?: string }) => {
    try {
      const [locations, users] = await Promise.all([
        searchService.getLocationSuggestions({ query, lang }),
        searchService.getUserSuggestions({ query })
      ])

      return [...locations, ...users]
    } catch (error) {
      if (error instanceof Error) {
        throw error
      } else {
        throw new Error('Error fetching suggestions')
      }
    }
  }
}
