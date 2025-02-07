import { getConnection } from '../../db.js'

export class ItineraryModel {
  static async getAll ({ location }) {
    const connection = await getConnection()
    try {
      let itineraries
      if (location) {
        const lowerCaseLocation = location.toLowerCase()

        itineraries = await connection.query(
          `SELECT 
              i.id,
              i.title,
              i.description,
              i.image,
              i.start_date,
              i.end_date,
              COALESCE(GROUP_CONCAT(DISTINCT l.name ORDER BY l.name SEPARATOR ', '), '') AS locations,
              BIN_TO_UUID(i.user_id) user_id,
              i.likes
          FROM itineraries i
          LEFT JOIN itinerary_locations il ON i.id = il.itinerary_id
          LEFT JOIN locations l ON il.location_id = l.id
          WHERE LOWER(l.name) = ?
          GROUP BY i.id;`,
          [lowerCaseLocation]
        )
      } else {
        itineraries = await connection.query(
          `SELECT 
              i.id,
              i.title,
              i.description,
              i.image,
              i.start_date,
              i.end_date,
              COALESCE(GROUP_CONCAT(DISTINCT l.name ORDER BY l.name SEPARATOR ', '), '') AS locations,
              BIN_TO_UUID(i.user_id) user_id,
              i.likes
          FROM itineraries i
          LEFT JOIN itinerary_locations il ON i.id = il.itinerary_id
          LEFT JOIN locations l ON il.location_id = l.id
          GROUP BY i.id;`
        )
      }

      const formattedItineraries = [itineraries].map(itinerary => ({
        ...itinerary,
        locations: itinerary.locations ? itinerary.locations.split(', ') : []
      }))

      return formattedItineraries
    } catch (e) {
      throw new Error('Error getting itineraries')
    } finally {
      connection.release()
    }
  }

  static async getById ({ id }) {
    const connection = await getConnection()
    try {
      const [itineraryRows] = await connection.query(
        `SELECT 
            i.id,
            i.title,
            i.description,
            i.image,
            i.start_date,
            i.end_date,
            COALESCE(GROUP_CONCAT(DISTINCT l.name ORDER BY l.name SEPARATOR ', '), '') AS locations,
            BIN_TO_UUID(i.user_id) user_id,
            i.likes
        FROM itineraries i
        LEFT JOIN itinerary_locations il ON i.id = il.itinerary_id
        LEFT JOIN locations l ON il.location_id = l.id
        WHERE i.id = ?
        GROUP BY i.id;`,
        [id]
      )
      if (itineraryRows.length === 0) throw new Error('Itinerary not found')

      const itinerary = {
        id: itineraryRows[0].id,
        title: itineraryRows[0].title,
        description: itineraryRows[0].description,
        image: itineraryRows[0].image,
        start_date: itineraryRows[0].start_date,
        end_date: itineraryRows[0].end_date,
        locations: itineraryRows[0].locations ? itineraryRows[0].locations.split(', ') : [],
        user_id: itineraryRows[0].user_id,
        likes: itineraryRows[0].likes,
        days: []
      }

      // Obtener los días
      const [daysRows] = await connection.query(
        `SELECT 
            id AS day_id,
            itinerary_id,
            label,
            day_number
        FROM itinerary_days
        WHERE itinerary_id = ?
        ORDER BY day_number;`,
        [id]
      )

      // Obtener los eventos
      const [eventsRows] = await connection.query(
        `SELECT 
            id AS event_id,
            day_id,
            order_index,
            label,
            description,
            image,
            content
        FROM itinerary_events
        WHERE day_id IN (SELECT id FROM itinerary_days WHERE itinerary_id = ?)
        ORDER BY day_id, order_index ASC;`,
        [id]
      )

      const dayMap = new Map()

      daysRows.forEach(day => {
        dayMap.set(day.day_id, {
          id: day.day_id,
          label: day.label,
          day_number: day.day_number,
          events: []
        })
      })

      eventsRows.forEach(event => {
        if (dayMap.has(event.day_id)) {
          dayMap.get(event.day_id).events.push({
            id: event.event_id,
            order_index: event.order_index,
            label: event.label,
            description: event.description,
            image: event.image,
            content: event.content
          })
        }
      })

      itinerary.days = Array.from(dayMap.values())

      return itinerary
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(e.message)
      } else {
        throw new Error('Error getting itinerary')
      }
    } finally {
      connection.release()
    }
  }

  // Obtener los itinerarios con más me gusta en la última semana
  static async getPopular () {
    const connection = await getConnection()
    try {
      const [itineraries] = await connection.query(
        `SELECT 
            i.id,
            i.title,
            i.description,
            i.image,
            i.start_date,
            i.end_date,
            COALESCE(locations.locations, '') AS locations,
            BIN_TO_UUID(i.user_id) user_id,
            i.likes,
            COALESCE(like_count_week.likes_last_week, 0) AS likes_last_week
        FROM itineraries i
        LEFT JOIN (
            SELECT 
                itinerary_id, 
                GROUP_CONCAT(DISTINCT l.name ORDER BY l.name SEPARATOR ', ') AS locations
            FROM itinerary_locations il
            LEFT JOIN locations l ON il.location_id = l.id
            GROUP BY itinerary_id
        ) AS locations ON i.id = locations.itinerary_id
        LEFT JOIN (
            SELECT itinerary_id, COUNT(*) AS likes_last_week
            FROM likes
            WHERE created_at >= NOW() - INTERVAL 7 DAY
            GROUP BY itinerary_id
        ) AS like_count_week ON i.id = like_count_week.itinerary_id
        ORDER BY likes_last_week DESC, i.likes DESC
        LIMIT 10;`
      )

      const formattedItineraries = itineraries.map(itinerary => ({
        ...itinerary,
        locations: itinerary.locations ? itinerary.locations.split(', ') : []
      }))

      return formattedItineraries
    } catch (e) {
      throw new Error('Error getting popular itineraries')
    } finally {
      connection.release()
    }
  }

  // Obtener los itinerarios de un usuario
  static async getUserItineraries ({ userId }) {
    const connection = await getConnection()
    try {
      const [itineraries] = await connection.query(
        `SELECT 
            i.id,
            i.title,
            i.description,
            i.image,
            i.start_date,
            i.end_date,
            COALESCE(GROUP_CONCAT(DISTINCT l.name ORDER BY l.name SEPARATOR ', '), '') AS locations,
            BIN_TO_UUID(i.user_id) user_id,
            i.likes
        FROM itineraries i
        LEFT JOIN itinerary_locations il ON i.id = il.itinerary_id
        LEFT JOIN locations l ON il.location_id = l.id
        WHERE i.user_id = UUID_TO_BIN(?)
        GROUP BY i.id;`,
        [userId]
      )

      const formattedItineraries = itineraries.map(itinerary => ({
        ...itinerary,
        locations: itinerary.locations ? itinerary.locations.split(', ') : []
      }))

      return formattedItineraries
    } catch (e) {
      throw new Error('Error getting user itineraries')
    } finally {
      connection.release()
    }
  }

  // Obtener los itinerarios a los que un usuario ha dado like
  static async getUserLikedItineraries ({ userId }) {
    const connection = await getConnection()
    try {
      const [itineraries] = await connection.query(
        `SELECT 
            i.id,
            i.title,
            i.description,
            i.image,
            i.start_date,
            i.end_date,
            COALESCE(GROUP_CONCAT(DISTINCT l.name ORDER BY l.name SEPARATOR ', '), '') AS locations,
            BIN_TO_UUID(i.user_id) user_id,
            i.likes
        FROM itineraries i
        LEFT JOIN itinerary_locations il ON i.id = il.itinerary_id
        LEFT JOIN locations l ON il.location_id = l.id
        JOIN likes ON i.id = likes.itinerary_id
        WHERE likes.user_id = UUID_TO_BIN(?)
        GROUP BY i.id;`,
        [userId]
      )

      const formattedItineraries = itineraries.map(itinerary => ({
        ...itinerary,
        locations: itinerary.locations ? itinerary.locations.split(', ') : []
      }))

      return formattedItineraries
    } catch (e) {
      throw new Error('Error getting user liked itineraries')
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
      locations: locationsInput,
      userId
    } = input

    const connection = await getConnection()
    try {
      await connection.beginTransaction()

      const [itineraryResult] = await connection.query(
        `INSERT INTO itineraries (title, description, image, start_date, end_date, user_id)
        VALUES (?, ?, ?, ?, ?, UUID_TO_BIN(?));`,
        [title, description, image, startDate, endDate, userId]
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

      const [locations] = await connection.query(
        `SELECT l.name 
        FROM locations l
        JOIN itinerary_locations il ON l.id = il.location_id
        WHERE il.itinerary_id = ?;`,
        [itineraryId]
      )

      const locationNames = locations.map(loc => loc.name)

      return { id: itineraryId, title, description, image, startDate, endDate, locations: locationNames, userId }
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
        `SELECT 
            i.id,
            i.title,
            i.description,
            i.image,
            i.start_date,
            i.end_date,
            COALESCE(GROUP_CONCAT(DISTINCT l.name ORDER BY l.name SEPARATOR ', '), '') AS locations,
            BIN_TO_UUID(i.user_id) user_id,
            i.likes
        FROM itineraries i
        LEFT JOIN itinerary_locations il ON i.id = il.itinerary_id
        LEFT JOIN locations l ON il.location_id = l.id
        WHERE i.id = ?
        GROUP BY i.id;`,
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

  static async updateEventOrder (itineraryId, dayId, reorderedEvents) {
    const connection = await getConnection()
    try {
      await connection.beginTransaction()

      for (const e of reorderedEvents) {
        const eventId = e.id
        const orderIndex = e.order_index
        await connection.query(
          'UPDATE itinerary_events SET order_index = ? WHERE id = ?;',
          [orderIndex, eventId]
        )
      }

      await connection.commit()

      return { message: 'Event order updated' }
    } catch (e) {
      await connection.rollback()
      throw new Error('Error updating event order')
    } finally {
      connection.release()
    }
  }
}
