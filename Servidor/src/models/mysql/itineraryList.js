import { getConnection } from '../../database/db.js'
import { DatabaseError, NotFoundError } from '../../errors/errors.js'

export class ItineraryListModel {
  static async getAll({ userId, username, likedBy, visibility, sort, limit, userIdSession }) {
    const connection = await getConnection()
    try {
      const queryParams = []
      let query = `
        SELECT 
          i.id,
          i.title,
          i.description,
          i.image,
          i.is_public AS isPublic,
          BIN_TO_UUID(i.user_id) AS userId,
          i.likes
      `

      if (sort === 'popular') {
        query += ', COALESCE(like_count_week.likes_last_week, 0) AS likesLastWeek'
      }

      query += ' FROM itinerary_lists i'

      if (sort === 'popular') {
        query += `
          LEFT JOIN (
            SELECT list_id, COUNT(*) AS likes_last_week
            FROM likes_lists
            WHERE created_at >= NOW() - INTERVAL 7 DAY
            GROUP BY list_id
          ) AS like_count_week ON i.id = like_count_week.list_id
        `
      }

      const filters = []

      if (userId) {
        filters.push('i.user_id = UUID_TO_BIN(?)')
        queryParams.push(userId)
      }

      if (username) {
        filters.push('i.user_id = (SELECT id FROM users WHERE username = ?)')
        queryParams.push(username)
      }

      if (likedBy) {
        query += ' JOIN likes_lists li ON i.id = li.list_id'
        filters.push('li.user_id = UUID_TO_BIN(?)')
        queryParams.push(likedBy)
      }

      if (visibility === 'public') {
        filters.push('i.is_public = 1')
      } else if (visibility === 'all') {
        filters.push(`
          (
            i.is_public = 1
            OR i.user_id = UUID_TO_BIN(?)
          )
        `)
        queryParams.push(userIdSession)
      }

      if (filters.length > 0) {
        query += ` WHERE ${filters.join(' AND ')}`
      }

      query += ' GROUP BY i.id'

      // Aplicar ordenamiento según el parámetro `sort`
      switch (sort) {
        case 'popular':
          query += ' ORDER BY likesLastWeek DESC, i.likes DESC'
          break
        case 'newest':
          query += ' ORDER BY i.created_at DESC'
          break
        case 'oldest':
          query += ' ORDER BY i.created_at ASC'
          break
        default:
          break
      }

      query += ' LIMIT ?'
      queryParams.push(limit)

      const [lists] = await connection.query(query, queryParams)

      return lists
    } catch (error) {
      throw new DatabaseError('Error while fetching itinerary lists: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async getById({ id }) {
    const connection = await getConnection()
    try {
      const [listRows] = await connection.query(
        `SELECT 
            i.id,
            i.title,
            i.description,
            i.image,
            i.is_public AS isPublic,
            BIN_TO_UUID(i.user_id) AS userId,
            i.likes,
            i.created_at AS createdAt,
            i.updated_at AS updatedAt
        FROM itinerary_lists i
        WHERE i.id = ?;`,
        [id]
      )
      if (listRows.length === 0) throw new NotFoundError(`Itinerary list with id ${id} not found`)

      const list = {
        id: listRows[0].id,
        title: listRows[0].title,
        description: listRows[0].description,
        image: listRows[0].image,
        isPublic: listRows[0].isPublic,
        userId: listRows[0].userId,
        likes: listRows[0].likes,
        createdAt: listRows[0].createdAt,
        updatedAt: listRows[0].updatedAt,
        itineraries: []
      }

      // Obtener los itinerarios dentro de la lista
      const [itinerariesRows] = await connection.query(
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
            i.likes
        FROM itineraries i
        LEFT JOIN locations l ON i.location_id = l.id
        INNER JOIN itinerary_list_items ili ON i.id = ili.itinerary_id
        WHERE ili.list_id = ?
        GROUP BY i.id;`,
        [id]
      )

      list.itineraries = itinerariesRows.map((itinerary) => ({
        id: itinerary.id,
        title: itinerary.title,
        description: itinerary.description,
        image: itinerary.image,
        startDate: itinerary.startDate,
        endDate: itinerary.endDate,
        location: {
          name: itinerariesRows[0].locationName,
          adminName1: itinerariesRows[0].locationAdminName1,
          countryName: itinerariesRows[0].locationCountryName
        },
        isPublic: itinerary.isPublic,
        userId: itinerary.userId,
        likes: itinerary.likes
      }))

      return list
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new Error('Error getting itinerary list: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async create({ input }) {
    const { title, description, image, isPublic, userId } = input

    const connection = await getConnection()
    try {
      await connection.beginTransaction()

      const [listResult] = await connection.query(
        `INSERT INTO itinerary_lists (title, description, image, is_public, user_id)
        VALUES (?, ?, ?, ?, UUID_TO_BIN(?));`,
        [title, description, image, isPublic, userId]
      )

      if (!listResult.insertId) {
        throw new DatabaseError('Failed to create itinerary list: ' + listResult.message)
      }

      const listId = listResult.insertId

      await connection.commit()

      return listId
    } catch (error) {
      await connection.rollback()
      throw new DatabaseError('Error creating itinerary list: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async delete({ id }) {
    const connection = await getConnection()
    try {
      const [result] = await connection.query('DELETE FROM itinerary_lists WHERE id = ?;', [id])
      if (result.affectedRows === 0) {
        throw new NotFoundError(`Itinerary list with id ${id} not found`)
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error deleting itinerary list: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async update({ id, input }) {
    const { title, description, image, isPublic } = input

    const connection = await getConnection()
    try {
      const [existingList] = await connection.query(
        'SELECT id FROM itinerary_lists WHERE id = ?;',
        [id]
      )
      if (existingList.length === 0) {
        throw new NotFoundError(`Itinerary list with id ${id} not found`)
      }

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
        queryParams.push(image)
      }
      if (typeof isPublic !== 'undefined') {
        updateFields.push('is_public = ?')
        queryParams.push(isPublic)
      }

      queryParams.push(id)

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE itinerary_lists 
                            SET ${updateFields.join(', ')}
                            WHERE id = ?;`

        const [updateResult] = await connection.query(updateQuery, queryParams)
        if (updateResult.affectedRows === 0) {
          throw new DatabaseError('Failed to update itinerary list: ' + updateResult.message)
        }
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error updating itinerary list: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async likeItineraryList({ userId, listId }) {
    const connection = await getConnection()
    try {
      const [existingList] = await connection.query(
        'SELECT id FROM itinerary_lists WHERE id = ?;',
        [listId]
      )
      if (existingList.length === 0) {
        throw new NotFoundError(`Itinerary list with id ${listId} not found`)
      }

      await connection.beginTransaction()

      const [result] = await connection.query(
        'INSERT IGNORE INTO likes_lists (user_id, list_id) VALUES (UUID_TO_BIN(?), ?);',
        [userId, listId]
      )
      if (result.affectedRows > 0) {
        await connection.query('UPDATE itinerary_lists SET likes = likes + 1 WHERE id = ?;', [
          listId
        ])
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error liking itinerary list: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async unlikeItineraryList({ userId, listId }) {
    const connection = await getConnection()
    try {
      const [existingList] = await connection.query(
        'SELECT id FROM itinerary_lists WHERE id = ?;',
        [listId]
      )
      if (existingList.length === 0) {
        throw new NotFoundError(`Itinerary list with id ${listId} not found`)
      }

      await connection.beginTransaction()

      const [result] = await connection.query(
        'DELETE FROM likes_lists WHERE user_id = UUID_TO_BIN(?) AND list_id = ?;',
        [userId, listId]
      )
      if (result.affectedRows > 0) {
        await connection.query('UPDATE itinerary_lists SET likes = likes - 1 WHERE id = ?;', [
          listId
        ])
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error unliking itinerary list: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async checkIfLiked({ listId, userId }) {
    const connection = await getConnection()
    try {
      const [result] = await connection.query(
        'SELECT 1 FROM likes_lists WHERE user_id = UUID_TO_BIN(?) AND list_id = ?;',
        [userId, listId]
      )

      return result.length > 0
    } catch (error) {
      throw new DatabaseError('Error checking if itinerary list is liked: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async addItineraryToList({ listId, itineraryId }) {
    const connection = await getConnection()
    try {
      const [existingList] = await connection.query(
        'SELECT id FROM itinerary_lists WHERE id = ?;',
        [listId]
      )
      if (existingList.length === 0) {
        throw new NotFoundError(`Itinerary list with id ${listId} not found`)
      }

      await connection.query(
        'INSERT IGNORE INTO itinerary_list_items (list_id, itinerary_id) VALUES (?, ?);',
        [listId, itineraryId]
      )
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error adding itinerary to list: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async removeItineraryFromList({ listId, itineraryId }) {
    const connection = await getConnection()
    try {
      const [existingList] = await connection.query(
        'SELECT id FROM itinerary_lists WHERE id = ?;',
        [listId]
      )
      if (existingList.length === 0) {
        throw new NotFoundError(`Itinerary list with id ${listId} not found`)
      }

      const [result] = await connection.query(
        'DELETE FROM itinerary_list_items WHERE list_id = ? AND itinerary_id = ?;',
        [listId, itineraryId]
      )
      if (result.affectedRows === 0) {
        throw new NotFoundError(`Itinerary with id ${itineraryId} not found in list ${listId}`)
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error removing itinerary from list: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }
}
