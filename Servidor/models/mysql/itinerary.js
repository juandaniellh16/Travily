import mysql from 'mysql2/promise'

const DEFAULT_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'itineraries_db'
}
const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG

const connection = await mysql.createConnection(connectionString)

export class ItineraryModel {
  static async getAll ({ location }) {
    if (location) {
      const lowerCaseLocation = location.toLowerCase()

      const [itineraries] = await connection.query(
        `SELECT
          BIN_TO_UUID(itineraries.id) id, 
          itineraries.title, 
          itineraries.description, 
          itineraries.startDate, 
          itineraries.endDate
        FROM itineraries
        JOIN itinerary_locations ON itineraries.id = itinerary_locations.itinerary_id
        JOIN locations ON itinerary_locations.location_id = locations.id
        WHERE LOWER(locations.name) = ?;`,
        [lowerCaseLocation]
      )

      return itineraries
    }

    const [itineraries] = await connection.query(
      'SELECT BIN_TO_UUID(id) id, title, description, startDate, endDate FROM itineraries;'
    )

    return itineraries
  }

  static async getById ({ id }) {
    const [itineraries] = await connection.query(
      `SELECT BIN_TO_UUID(id) id, title, description, startDate, endDate 
      FROM itineraries 
      WHERE id = UUID_TO_BIN(?);`,
      [id]
    )

    if (itineraries.length === 0) return null

    return itineraries[0]
  }

  static async create ({ input }) {
    const {
      title,
      description,
      startDate,
      endDate,
      locations: locationsInput
    } = input

    const uuid = crypto.randomUUID()

    try {
      await connection.beginTransaction()

      await connection.query(
        `INSERT INTO itineraries (id, title, description, startDate, endDate)
        VALUES (UUID_TO_BIN(?), ?, ?, ?, ?);`,
        [uuid, title, description, startDate, endDate]
      )

      for (const locationName of locationsInput) {
        const lowerCaseLocation = locationName.toLowerCase()

        const [location] = await connection.query(
          'SELECT id FROM locations WHERE LOWER(name) = ?;',
          [lowerCaseLocation]
        )

        let locationId
        if (location.length === 0) {
          const result = await connection.query(
            'INSERT INTO locations (name) VALUES (?);',
            [locationName]
          )
          locationId = result[0].insertId
        } else {
          locationId = location[0].id
        }

        await connection.query(
          `INSERT INTO itinerary_locations (itinerary_id, location_id)
          VALUES (UUID_TO_BIN(?), ?);`,
          [uuid, locationId]
        )
      }

      await connection.commit()

      const [itineraries] = await connection.query(
        `SELECT BIN_TO_UUID(id) id, title, description, startDate, endDate 
        FROM itineraries WHERE id = UUID_TO_BIN(?);`,
        [uuid]
      )

      return itineraries[0]
    } catch (e) {
      await connection.rollback()
      throw new Error('Error creating itinerary')
    }
  }

  static async delete ({ id }) {
    try {
      const [result] = await connection.query(
        'DELETE FROM itineraries WHERE id = UUID_TO_BIN(?);',
        [id]
      )
      return result.affectedRows > 0
    } catch (e) {
      throw new Error('Error deleting itinerary')
    }
  }

  static async update ({ id, input }) {
    const {
      title,
      description,
      startDate,
      endDate,
      locations: locationsInput
    } = input

    try {
      await connection.beginTransaction()

      const updateFields = []
      const queryParams = []

      if (title) {
        updateFields.push('title = ?')
        queryParams.push(title)
      }
      if (description) {
        updateFields.push('description = ?')
        queryParams.push(description)
      }
      if (startDate) {
        updateFields.push('startDate = ?')
        queryParams.push(startDate)
      }
      if (endDate) {
        updateFields.push('endDate = ?')
        queryParams.push(endDate)
      }

      queryParams.push(id)

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE itineraries 
                            SET ${updateFields.join(', ')}
                            WHERE id = UUID_TO_BIN(?);`

        await connection.query(updateQuery, queryParams)
      }

      if (locationsInput) {
        await connection.query(
          'DELETE FROM itinerary_locations WHERE itinerary_id = UUID_TO_BIN(?);',
          [id]
        )

        for (const locationName of locationsInput) {
          const lowerCaseLocation = locationName.toLowerCase()

          const [location] = await connection.query(
            'SELECT id FROM locations WHERE LOWER(name) = ?;',
            [lowerCaseLocation]
          )

          let locationId
          if (location.length === 0) {
            const result = await connection.query(
              'INSERT INTO locations (name) VALUES (?);',
              [locationName]
            )
            locationId = result[0].insertId
          } else {
            locationId = location[0].id
          }

          await connection.query(
          `INSERT INTO itinerary_locations (itinerary_id, location_id)
          VALUES (UUID_TO_BIN(?), ?);`,
          [id, locationId]
          )
        }
      }

      await connection.commit()

      const [itineraries] = await connection.query(
        `SELECT BIN_TO_UUID(id) id, title, description, startDate, endDate 
        FROM itineraries 
        WHERE id = UUID_TO_BIN(?);`,
        [id]
      )

      return itineraries[0]
    } catch (e) {
      await connection.rollback()
      throw new Error('Error updating itinerary')
    }
  }
}
