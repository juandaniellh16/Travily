import { getConnection } from '../../database/db.js'
import { DatabaseError } from '../../errors/errors.js'

export class SearchModel {
  static async searchLocations({ query, lang = 'es' }) {
    const geonamesUrl = `http://api.geonames.org/searchJSON?name_startsWith=${query}&featureCode=PCLI&featureCode=ADM1&featureCode=ADM2&featureCode=PPL&featureCode=PPLA&featureCode=PPLA2&featureCode=PPLA3&featureCode=PPLC&orderBy=relevance&lang=${lang}&maxRows=5&style=FULL&username=juandaniellh16`

    const response = await fetch(geonamesUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        errorData.error || 'Error fetching location suggestions from GeoNames: ' + errorData.message
      )
    }

    const data = await response.json()

    const filteredData = data.geonames.filter((loc) => loc.population > 5000)

    const uniqueLocations = []
    const cityNames = new Set()

    filteredData.forEach((location) => {
      if (location.fcode === 'PPLC') {
        if (!cityNames.has(location.name)) {
          uniqueLocations.push(location)
          cityNames.add(location.name)
        }
      } else if (location.fcode === 'PPLA3') {
        if (!cityNames.has(location.name)) {
          uniqueLocations.push(location)
          cityNames.add(location.name)
        }
      } else {
        uniqueLocations.push(location)
      }
    })

    return uniqueLocations.map((location) => ({
      type: 'location',
      geonameId: location.geonameId,
      name: location.name,
      alternateNames: location.alternateNames,
      countryName: location.countryName,
      adminName1: location.adminName1,
      fcode: location.fcode,
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng)
    }))
  }

  static async searchUsers({ query }) {
    const connection = await getConnection()
    try {
      const [users] = await connection.query(
        `SELECT 'user' AS type, BIN_TO_UUID(id) AS id, username AS name, avatar
        FROM users 
        WHERE username LIKE ? OR name LIKE ? 
        LIMIT 5;`,
        [`${query}%`, `${query}%`]
      )
      return users
    } catch (error) {
      throw new DatabaseError('Error fetching user suggestions: ' + error.message)
    } finally {
      connection.release()
    }
  }
}
