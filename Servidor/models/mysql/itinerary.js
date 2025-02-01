import { getConnection } from '../../db.js'

export class ItineraryModel {
  static async getAll ({ location }) {
    const connection = await getConnection()
    try {
      if (location) {
        const lowerCaseLocation = location.toLowerCase()

        const [itineraries] = await connection.query(
          `SELECT itineraries.*
          FROM itineraries
          JOIN itinerary_locations ON itineraries.id = itinerary_locations.itinerary_id
          JOIN locations ON itinerary_locations.location_id = locations.id
          WHERE LOWER(locations.name) = ?;`,
          [lowerCaseLocation]
        )

        return itineraries
      }

      const [itineraries] = await connection.query(
        'SELECT itineraries.* FROM itineraries;'
      )

      return itineraries
    } catch (e) {
      throw new Error('Error creating user')
    } finally {
      connection.release()
    }
  }

  static async getById ({ id }) {
    const connection = await getConnection()
    try {
      const [itineraries] = await connection.query(
        `SELECT itineraries.* 
        FROM itineraries 
        WHERE id = ?;`,
        [id]
      )

      if (itineraries.length === 0) return null

      return itineraries[0]
    } catch (e) {
      throw new Error('Error creating user')
    } finally {
      connection.release()
    }
  }

  // Obtener los itinerarios con más me gusta en la última semana
  static async getPopular () {
    const connection = await getConnection()
    try {
      const [itineraries] = await connection.query(
      `SELECT itineraries.*, 
              COALESCE(like_count_week.likes_last_week, 0) AS likes_last_week
      FROM itineraries
      LEFT JOIN (
          SELECT itinerary_id, COUNT(*) AS likes_last_week
          FROM likes
          WHERE created_at >= NOW() - INTERVAL 7 DAY
          GROUP BY itinerary_id
      ) AS like_count_week ON itineraries.id = like_count_week.itinerary_id
      ORDER BY likes_last_week DESC, itineraries.likes DESC
      LIMIT 10;`)

      return itineraries
    } catch (e) {
      throw new Error('Error getting popular itineraries')
    } finally {
      connection.release()
    }
  }

  static async create ({ input }) {
    const {
      title,
      description,
      image,
      startDate,
      endDate,
      locations: locationsInput
    } = input

    const connection = await getConnection()
    try {
      await connection.beginTransaction()

      const [itineraryResult] = await connection.query(
        `INSERT INTO itineraries (title, description, image, start_date, end_date)
        VALUES (?, ?, ?, ?, ?);`,
        [title, description, image, startDate, endDate]
      )

      const itineraryId = itineraryResult.insertId

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
          VALUES (?, ?);`,
          [itineraryId, locationId]
        )
      }

      await connection.commit()

      return { id: itineraryId, title, description, image, startDate, endDate }
    } catch (e) {
      await connection.rollback()
      throw new Error('Error creating itinerary')
    } finally {
      connection.release()
    }
  }

  static async delete ({ id }) {
    const connection = await getConnection()
    try {
      const [result] = await connection.query(
        'DELETE FROM itineraries WHERE id = ?;',
        [id]
      )
      return result.affectedRows > 0
    } catch (e) {
      throw new Error('Error deleting itinerary')
    } finally {
      connection.release()
    }
  }

  static async update ({ id, input }) {
    const {
      title,
      description,
      image,
      startDate,
      endDate,
      locations: locationsInput
    } = input

    const connection = await getConnection()
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
      if (image) {
        updateFields.push('image = ?')
        queryParams.push(description)
      }
      if (startDate) {
        updateFields.push('start_date = ?')
        queryParams.push(startDate)
      }
      if (endDate) {
        updateFields.push('end_date = ?')
        queryParams.push(endDate)
      }

      queryParams.push(id)

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE itineraries 
                            SET ${updateFields.join(', ')}
                            WHERE id = ?;`

        await connection.query(updateQuery, queryParams)
      }

      if (locationsInput) {
        await connection.query(
          'DELETE FROM itinerary_locations WHERE itinerary_id = ?;',
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
          VALUES (?, ?);`,
          [id, locationId]
          )
        }
      }

      await connection.commit()

      const [itineraries] = await connection.query(
        `SELECT itineraries.* 
        FROM itineraries 
        WHERE id = ?;`,
        [id]
      )

      return itineraries[0]
    } catch (e) {
      await connection.rollback()
      throw new Error('Error updating itinerary')
    } finally {
      connection.release()
    }
  }

  static async likeItinerary (userId, itineraryId) {
    const connection = await getConnection()
    try {
      await connection.beginTransaction()

      const [existingLike] = await connection.query(
        'SELECT * FROM likes WHERE user_id = UUID_TO_BIN(?) AND itinerary_id = ?;',
        [userId, itineraryId]
      )

      if (existingLike.length > 0) {
        throw new Error('Itinerary already liked')
      }

      await connection.query(
        'INSERT INTO likes (user_id, itinerary_id) VALUES (UUID_TO_BIN(?), ?);',
        [userId, itineraryId]
      )

      await connection.query(
        'UPDATE itineraries SET likes = likes + 1 WHERE id = ?;',
        [itineraryId]
      )

      await connection.commit()

      return { message: 'Itinerary liked' }
    } catch (e) {
      await connection.rollback()
      throw new Error('Error liking itinerary')
    } finally {
      connection.release()
    }
  }

  static async unlikeItinerary (userId, itineraryId) {
    const connection = await getConnection()
    try {
      await connection.beginTransaction()

      const [existingLike] = await connection.query(
        'SELECT * FROM likes WHERE user_id = UUID_TO_BIN(?) AND itinerary_id = ?;',
        [userId, itineraryId]
      )

      if (existingLike.length === 0) {
        throw new Error('Itinerary not liked')
      }

      await connection.query(
        'DELETE FROM likes WHERE user_id = UUID_TO_BIN(?) AND itinerary_id = ?;',
        [userId, itineraryId]
      )

      await connection.query(
        'UPDATE itineraries SET likes = likes - 1 WHERE id = ?;',
        [itineraryId]
      )

      await connection.commit()

      return { message: 'Itinerary unliked' }
    } catch (e) {
      await connection.rollback()
      throw new Error('Error unliking itinerary')
    } finally {
      connection.release()
    }
  }

  static async likedItinerary (userId, itineraryId) {
    const connection = await getConnection()
    try {
      const [result] = await connection.query(
        'SELECT COUNT(*) AS liked FROM likes WHERE user_id = UUID_TO_BIN(?) AND itinerary_id = ?;',
        [userId, itineraryId]
      )

      return { liked: result[0].liked > 0 }
    } catch (e) {
      throw new Error('Error checking if itinerary is liked')
    } finally {
      connection.release()
    }
  }
}
