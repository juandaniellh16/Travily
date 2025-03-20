import { API_BASE_URL } from '@/config/config'

export const searchService = {
  getSuggestions: async (query: string) => {
    const response = await fetch(`${API_BASE_URL}/search?query=${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error fetching suggestions')
    }
    return await response.json()
  }
}
