import { getConnection } from '../../database/db.js'
import { DatabaseError, NotFoundError, UnauthorizedError } from '../../errors/errors.js'

export class ItineraryModel {
  static async getAll({
    location,
    userId,
    username,
    role,
    likedBy,
    followedBy,
    visibility,
    sort,
    limit,
    userIdSession
  }) {
    const connection = await getConnection()
    try {
      const queryParams = []
      let query = `
        SELECT 
          i.id,
          i.title,
          i.description,
          i.image,
          i.start_date AS startDate,
          i.end_date AS endDate,
          MAX(l.name) AS locationName,
          MAX(l.admin_name_1) AS locationAdminName1,
          MAX(l.country_name) AS locationCountryName,
          i.is_public AS isPublic,
          BIN_TO_UUID(i.user_id) AS userId,
          i.likes
      `

      if (sort === 'popular') {
        query += ', COALESCE(like_count_week.likes_last_week, 0) AS likesLastWeek'
      }

      query += `
        FROM itineraries i
        LEFT JOIN locations l ON i.location_id = l.id
      `

      if (sort === 'popular') {
        query += `
          LEFT JOIN (
            SELECT itinerary_id, COUNT(*) AS likes_last_week
            FROM likes
            WHERE created_at >= NOW() - INTERVAL 7 DAY
            GROUP BY itinerary_id
          ) AS like_count_week ON i.id = like_count_week.itinerary_id
        `
      }

      const filters = []

      if (userId) {
        if (role === 'owner') {
          filters.push('i.user_id = UUID_TO_BIN(?)')
          queryParams.push(userId)
        } else if (role === 'collaborator') {
          filters.push(`
            EXISTS (
              SELECT 1 FROM itinerary_collaborators ic
              WHERE ic.itinerary_id = i.id 
              AND ic.user_id = UUID_TO_BIN(?)
            )
          `)
          queryParams.push(userId)
        } else {
          filters.push(`
            (
              i.user_id = UUID_TO_BIN(?)
              OR EXISTS (
                SELECT 1 FROM itinerary_collaborators ic
                WHERE ic.itinerary_id = i.id 
                AND ic.user_id = UUID_TO_BIN(?)
              )
            )
          `)
          queryParams.push(userId, userId)
        }
      }

      if (username) {
        if (role === 'owner') {
          filters.push('i.user_id = (SELECT id FROM users WHERE username = ?)')
          queryParams.push(username)
        } else if (role === 'collaborator') {
          filters.push(`
            EXISTS (
              SELECT 1 FROM itinerary_collaborators ic
              WHERE ic.itinerary_id = i.id 
              AND ic.user_id = (SELECT id FROM users WHERE username = ?)
            )
          `)
          queryParams.push(username)
        } else {
          filters.push(`
            (
              i.user_id = (SELECT id FROM users WHERE username = ?)
              OR EXISTS (
                SELECT 1 FROM itinerary_collaborators ic
                WHERE ic.itinerary_id = i.id 
                AND ic.user_id = (SELECT id FROM users WHERE username = ?)
              )
            )
          `)
          queryParams.push(username, username)
        }
      }

      if (likedBy) {
        query += ' JOIN likes li ON i.id = li.itinerary_id'
        filters.push('li.user_id = UUID_TO_BIN(?)')
        queryParams.push(likedBy)
      }

      if (followedBy) {
        filters.push(`
          i.user_id IN (
            SELECT following_id
            FROM followers
            WHERE follower_id = UUID_TO_BIN(?)
          )
        `)
        queryParams.push(followedBy)
      }

      if (visibility === 'public') {
        filters.push('i.is_public = 1')
      } else if (visibility === 'all') {
        filters.push(`
          (
            i.is_public = 1
            OR i.user_id = UUID_TO_BIN(?)
            OR EXISTS (
              SELECT 1 FROM itinerary_collaborators ic
              WHERE ic.itinerary_id = i.id 
              AND ic.user_id = UUID_TO_BIN(?)
            )
          )
        `)
        queryParams.push(userIdSession, userIdSession)
      }

      if (filters.length > 0) {
        query += ` WHERE ${filters.join(' AND ')}`
      }

      query += ' GROUP BY i.id'

      if (location) {
        const parts = location.split(',').map((part) => part.trim().toLowerCase())

        switch (parts.length) {
          case 1:
            query +=
              ' HAVING LOWER(locationName) LIKE ? OR LOWER(locationAdminName1) LIKE ? OR LOWER(locationCountryName) LIKE ?'
            queryParams.push(`${parts[0]}%`, `${parts[0]}%`, `${parts[0]}%`)
            break

          case 2:
            query +=
              ' HAVING (LOWER(locationName) LIKE ? AND LOWER(locationAdminName1) LIKE ?) OR (LOWER(locationAdminName1) LIKE ? AND LOWER(locationCountryName) LIKE ?)'
            queryParams.push(`${parts[0]}%`, `${parts[1]}%`, `${parts[0]}%`, `${parts[1]}%`)
            break

          case 3:
            query +=
              ' HAVING LOWER(locationName) LIKE ? AND LOWER(locationAdminName1) LIKE ? AND LOWER(locationCountryName) LIKE ?'
            queryParams.push(`${parts[0]}%`, `${parts[1]}%`, `${parts[2]}%`)
            break

          default:
            break
        }
      }

      // Aplicar ordenamiento según el parámetro `sort`
      switch (sort) {
        case 'popular':
          query += ' ORDER BY likesLastWeek DESC, i.likes DESC'
          break
        case 'newest':
          query += ' ORDER BY i.start_date DESC'
          break
        case 'oldest':
          query += ' ORDER BY i.start_date ASC'
          break
        default:
          break
      }

      query += ' LIMIT ?'
      queryParams.push(limit)

      const [itineraries] = await connection.query(query, queryParams)

      const formattedItineraries = itineraries.map((itinerary) => ({
        ...itinerary,
        location: {
          name: itinerary.locationName,
          adminName1: itinerary.locationAdminName1,
          countryName: itinerary.locationCountryName
        }
      }))

      return formattedItineraries
    } catch (error) {
      throw new DatabaseError('Error while fetching itineraries: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async getById({ id }) {
    const connection = await getConnection()
    try {
      const [itineraryRows] = await connection.query(
        `SELECT 
            i.id,
            i.title,
            i.description,
            i.image,
            i.start_date AS startDate,
            i.end_date AS endDate,
            MAX(l.name) AS locationName,
            MAX(l.admin_name_1) AS locationAdminName1,
            MAX(l.country_name) AS locationCountryName,
            i.is_public AS isPublic,
            BIN_TO_UUID(i.user_id) AS userId,
            COALESCE(GROUP_CONCAT(DISTINCT BIN_TO_UUID(ic.user_id) ORDER BY ic.user_id SEPARATOR ', '), '') AS collaborators,
            i.likes,
            i.created_at AS createdAt,
            i.updated_at AS updatedAt
        FROM itineraries i
        LEFT JOIN locations l ON i.location_id = l.id
        LEFT JOIN itinerary_collaborators ic ON i.id = ic.itinerary_id
        WHERE i.id = ?
        GROUP BY i.id;`,
        [id]
      )
      if (itineraryRows.length === 0) throw new NotFoundError(`Itinerary with id ${id} not found`)

      const itinerary = {
        id: itineraryRows[0].id,
        title: itineraryRows[0].title,
        description: itineraryRows[0].description,
        image: itineraryRows[0].image,
        startDate: itineraryRows[0].startDate,
        endDate: itineraryRows[0].endDate,
        location: {
          name: itineraryRows[0].locationName,
          adminName1: itineraryRows[0].locationAdminName1,
          countryName: itineraryRows[0].locationCountryName
        },
        isPublic: itineraryRows[0].isPublic,
        userId: itineraryRows[0].userId,
        collaborators: itineraryRows[0].collaborators
          ? itineraryRows[0].collaborators.split(', ')
          : [],
        likes: itineraryRows[0].likes,
        createdAt: itineraryRows[0].createdAt,
        updatedAt: itineraryRows[0].updatedAt,
        days: []
      }

      // Obtener los días
      const [daysRows] = await connection.query(
        `SELECT 
            id AS dayId,
            itinerary_id AS itineraryId,
            label,
            day_number AS dayNumber
        FROM itinerary_days
        WHERE itinerary_id = ?
        ORDER BY day_number;`,
        [id]
      )

      // Obtener los eventos
      const [eventsRows] = await connection.query(
        `SELECT 
            id AS eventId,
            day_id AS dayId,
            order_index AS orderIndex,
            label,
            description,
            category,
            image,
            start_time AS startTime,
            end_time AS endTime
        FROM itinerary_events
        WHERE day_id IN (SELECT id FROM itinerary_days WHERE itinerary_id = ?)
        ORDER BY day_id, order_index ASC;`,
        [id]
      )

      const dayMap = new Map()

      daysRows.forEach((day) => {
        dayMap.set(day.dayId, {
          id: day.dayId,
          label: day.label,
          dayNumber: day.dayNumber,
          events: []
        })
      })

      eventsRows.forEach((event) => {
        if (dayMap.has(event.dayId)) {
          dayMap.get(event.dayId).events.push({
            id: event.eventId,
            orderIndex: event.orderIndex,
            label: event.label,
            description: event.description,
            category: event.category,
            image: event.image,
            startTime: event.startTime,
            endTime: event.endTime
          })
        }
      })

      itinerary.days = Array.from(dayMap.values())

      return itinerary
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new Error('Error getting itinerary: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async create({ input }) {
    const { title, description, image, startDate, endDate, location, isPublic, userId } = input

    const connection = await getConnection()
    try {
      await connection.beginTransaction()

      await connection.query(
        `INSERT INTO locations (geoname_id, name, country_name, admin_name_1, fcode, lat, lng)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          country_name = VALUES(country_name),
          admin_name_1 = VALUES(admin_name_1),
          fcode = VALUES(fcode),
          lat = VALUES(lat),
          lng = VALUES(lng);`,
        [
          location.geonameId,
          location.name,
          location.countryName,
          location.adminName1,
          location.fcode,
          location.lat,
          location.lng
        ]
      )

      const [locationIdResult] = await connection.query(
        'SELECT id FROM locations WHERE geoname_id = ?;',
        [location.geonameId]
      )

      if (locationIdResult.length === 0) {
        throw new DatabaseError(
          'Location not found after insert/update: ' + locationIdResult.message
        )
      }

      const locationId = locationIdResult[0].id

      const [itineraryResult] = await connection.query(
        `INSERT INTO itineraries (title, description, image, start_date, end_date, location_id, is_public, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, UUID_TO_BIN(?));`,
        [title, description, image, startDate, endDate, locationId, isPublic, userId]
      )

      const itineraryId = itineraryResult.insertId

      if (!itineraryId) {
        throw new DatabaseError('Failed to create itinerary: ' + itineraryResult.message)
      }

      const start = new Date(startDate)
      const end = new Date(endDate)
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      for (let i = 0; i < duration; i++) {
        const date = new Date(start)
        date.setDate(date.getDate() + i)

        const formatted = date.toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        })

        const label = `Día ${i + 1} - ${formatted.charAt(0).toUpperCase()}${formatted.slice(1)}`

        await connection.query(
          `INSERT INTO itinerary_days (itinerary_id, label, day_number) VALUES (?, ?, ?);`,
          [itineraryId, label, i + 1]
        )
      }

      await connection.commit()
      return itineraryId
    } catch (error) {
      await connection.rollback()
      throw new DatabaseError('Error creating itinerary: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async delete({ id }) {
    const connection = await getConnection()
    try {
      const [result] = await connection.query('DELETE FROM itineraries WHERE id = ?;', [id])
      if (result.affectedRows === 0) {
        throw new NotFoundError(`Itinerary with id ${id} not found`)
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error deleting itinerary: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async update({ id, input }) {
    const { title, description, image, startDate, endDate, location, isPublic } = input

    const connection = await getConnection()
    try {
      const [existingItinerary] = await connection.query(
        'SELECT id FROM itineraries WHERE id = ?;',
        [id]
      )
      if (existingItinerary.length === 0) {
        throw new NotFoundError(`Itinerary with id ${id} not found`)
      }

      await connection.beginTransaction()

      const updateFields = []
      const queryParams = []

      if (title) {
        updateFields.push('title = ?')
        queryParams.push(title)
      }
      if (typeof description !== 'undefined') {
        updateFields.push('description = ?')
        queryParams.push(description)
      }
      if (image) {
        updateFields.push('image = ?')
        queryParams.push(image)
      }
      if (startDate) {
        updateFields.push('start_date = ?')
        queryParams.push(startDate)
      }
      if (endDate) {
        updateFields.push('end_date = ?')
        queryParams.push(endDate)
      }
      if (typeof isPublic !== 'undefined') {
        updateFields.push('is_public = ?')
        queryParams.push(isPublic)
      }

      if (location) {
        await connection.query(
          `INSERT INTO locations (geoname_id, name, country_name, admin_name_1, fcode, lat, lng)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            country_name = VALUES(country_name),
            admin_name_1 = VALUES(admin_name_1),
            fcode = VALUES(fcode),
            lat = VALUES(lat),
            lng = VALUES(lng);`,
          [
            location.geonameId,
            location.name,
            location.countryName,
            location.adminName1,
            location.fcode,
            location.lat,
            location.lng
          ]
        )

        const [locationIdResult] = await connection.query(
          'SELECT id FROM locations WHERE geoname_id = ?;',
          [location.geonameId]
        )

        if (locationIdResult.length === 0) {
          throw new DatabaseError(
            'Location not found after insert/update: ' + locationIdResult.message
          )
        }

        const locationId = locationIdResult[0].id
        updateFields.push('location_id = ?')
        queryParams.push(locationId)
      }

      queryParams.push(id)

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE itineraries 
                            SET ${updateFields.join(', ')}
                            WHERE id = ?;`

        const [updateResult] = await connection.query(updateQuery, queryParams)
        if (updateResult.affectedRows === 0) {
          throw new DatabaseError('Failed to update itinerary: ' + updateResult.message)
        }
      }

      if (startDate) {
        const [days] = await connection.query(
          'SELECT id, day_number FROM itinerary_days WHERE itinerary_id = ?;',
          [id]
        )

        for (const day of days) {
          const newDate = new Date(startDate)
          newDate.setDate(newDate.getDate() + (day.day_number - 1))

          let formattedDate = newDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })
          formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

          const [updateDaysResult] = await connection.query(
            'UPDATE itinerary_days SET label = ? WHERE id = ?;',
            [`Día ${day.day_number} - ${formattedDate}`, day.id]
          )
          if (updateDaysResult.affectedRows === 0) {
            throw new DatabaseError('Failed to update itinerary days: ' + updateDaysResult.message)
          }
        }
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error updating itinerary: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async likeItinerary({ userId, itineraryId }) {
    const connection = await getConnection()
    try {
      const [existingItinerary] = await connection.query(
        'SELECT id FROM itineraries WHERE id = ?;',
        [itineraryId]
      )
      if (existingItinerary.length === 0) {
        throw new NotFoundError(`Itinerary with id ${itineraryId} not found`)
      }

      await connection.beginTransaction()

      const [result] = await connection.query(
        'INSERT IGNORE INTO likes (user_id, itinerary_id) VALUES (UUID_TO_BIN(?), ?);',
        [userId, itineraryId]
      )
      if (result.affectedRows > 0) {
        await connection.query('UPDATE itineraries SET likes = likes + 1 WHERE id = ?;', [
          itineraryId
        ])
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error liking itinerary: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async unlikeItinerary({ userId, itineraryId }) {
    const connection = await getConnection()
    try {
      const [existingItinerary] = await connection.query(
        'SELECT id FROM itineraries WHERE id = ?;',
        [itineraryId]
      )
      if (existingItinerary.length === 0) {
        throw new NotFoundError(`Itinerary with id ${itineraryId} not found`)
      }

      await connection.beginTransaction()

      const [result] = await connection.query(
        'DELETE FROM likes WHERE user_id = UUID_TO_BIN(?) AND itinerary_id = ?;',
        [userId, itineraryId]
      )
      if (result.affectedRows > 0) {
        await connection.query('UPDATE itineraries SET likes = likes - 1 WHERE id = ?;', [
          itineraryId
        ])
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error unliking itinerary: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async checkIfLiked({ itineraryId, userId }) {
    const connection = await getConnection()
    try {
      const [result] = await connection.query(
        'SELECT 1 FROM likes WHERE user_id = UUID_TO_BIN(?) AND itinerary_id = ?;',
        [userId, itineraryId]
      )

      return result.length > 0
    } catch (error) {
      throw new DatabaseError('Error checking if itinerary is liked: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async addCollaborator({ itineraryId, username, userIdSession }) {
    const connection = await getConnection()
    try {
      const [itinerary] = await connection.query(
        'SELECT BIN_TO_UUID(user_id) user_id FROM itineraries WHERE id = ?;',
        [itineraryId]
      )
      if (itinerary.length === 0) {
        throw new NotFoundError(`Itinerary with id ${itineraryId} not found`)
      }

      if (itinerary[0].user_id !== userIdSession) {
        throw new UnauthorizedError(
          'You are not authorized to add a collaborator to this itinerary'
        )
      }

      const [users] = await connection.query(
        'SELECT BIN_TO_UUID(id) id FROM users WHERE username = ?;',
        [username]
      )
      if (users.length === 0) {
        throw new NotFoundError(`User with username ${username} not found`)
      }

      await connection.query(
        `INSERT IGNORE INTO itinerary_collaborators (itinerary_id, user_id)
        VALUES (?, UUID_TO_BIN(?))`,
        [itineraryId, users[0].id]
      )
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
        throw error
      } else {
        throw new DatabaseError('Error adding collaborator: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async getCollaborators({ itineraryId, userIdSession }) {
    const connection = await getConnection()
    try {
      const [existingItinerary] = await connection.query(
        'SELECT is_public, BIN_TO_UUID(user_id) user_id FROM itineraries WHERE id = ?;',
        [itineraryId]
      )
      if (existingItinerary.length === 0) {
        throw new NotFoundError(`Itinerary with id ${itineraryId} not found`)
      }

      const itinerary = existingItinerary[0]

      const [collaborators] = await connection.query(
        `SELECT BIN_TO_UUID(u.id) id, u.name, u.username, u.avatar
        FROM users u
        WHERE u.id = (
          SELECT i.user_id 
          FROM itineraries i
          WHERE i.id = ?
        )
        UNION
        SELECT BIN_TO_UUID(u.id) id, u.name, u.username, u.avatar
        FROM users u
        JOIN itinerary_collaborators ic ON u.id = ic.user_id
        WHERE ic.itinerary_id = ?;`,
        [itineraryId, itineraryId]
      )

      if (!itinerary.is_public) {
        const isCollaborator = collaborators.some(
          (collaborator) => collaborator.id === userIdSession
        )
        if (!isCollaborator) {
          throw new UnauthorizedError(
            'You are not authorized to view collaborators for this itinerary'
          )
        }
      }

      return collaborators
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
        throw error
      } else {
        throw new DatabaseError('Error getting collaborators: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async checkIfCollaborator({ itineraryId, userId }) {
    const connection = await getConnection()
    try {
      const [result] = await connection.query(
        `SELECT 1
         FROM itineraries i
         LEFT JOIN itinerary_collaborators ic ON ic.itinerary_id = i.id
         LEFT JOIN users u ON u.id = i.user_id OR u.id = ic.user_id
         WHERE i.id = ? 
           AND (i.user_id = UUID_TO_BIN(?) OR ic.user_id = UUID_TO_BIN(?))
         LIMIT 1;`,
        [itineraryId, userId, userId]
      )

      return result.length > 0
    } catch (error) {
      throw new DatabaseError('Error checking if user is collaborator: ' + error.message)
    } finally {
      connection.release()
    }
  }
}
