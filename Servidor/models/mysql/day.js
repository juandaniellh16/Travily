import { getConnection } from '../../config/db.js'
import { DatabaseError, NotFoundError } from '../../errors/errors.js'

export class DayModel {
  static async addDay ({ itineraryId, day }) {
    const { label, dayNumber } = day
    const connection = await getConnection()
    try {
      const [result] = await connection.query(
        'INSERT INTO itinerary_days (itinerary_id, label, day_number) VALUES (?, ?, ?);',
        [itineraryId, label, dayNumber]
      )

      if (!result.insertId) {
        throw new DatabaseError('Failed to add day: ' + result.message)
      }

      const newDayId = result.insertId

      return { id: newDayId, label, dayNumber }
    } catch (error) {
      throw new DatabaseError('Error adding day: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async deleteDay ({ dayId }) {
    const connection = await getConnection()
    try {
      const [result] = await connection.query(
        'DELETE FROM itinerary_days WHERE id = ?;',
        [dayId]
      )
      if (result.affectedRows === 0) {
        throw new NotFoundError(`Day with id ${dayId} not found`)
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error deleting day: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async updateDays ({ days }) {
    const connection = await getConnection()
    try {
      const dayNumberCase = days
        .map(day => `WHEN id = ${day.id} THEN ${day.dayNumber}`)
        .join(' ')

      const labelCase = days
        .map(day => `WHEN id = ${day.id} THEN '${day.label.replace("'", "''")}'`)
        .join(' ')

      const query = `
        UPDATE itinerary_days
        SET
          day_number = CASE ${dayNumberCase} END,
          label = CASE ${labelCase} END
        WHERE id IN (${days.map(day => day.id).join(', ')})
      `

      const [updateResult] = await connection.query(query)
      if (updateResult.affectedRows === 0) {
        throw new DatabaseError('Failed to update itinerary days: ' + updateResult.message)
      }
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error
      } else {
        throw new DatabaseError('Error updating itinerary days: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  /*
  static async updateEvent ({ eventId, updatedEventData }) {
    const connection = await getConnection()
    try {
      const [existingEvent] = await connection.query(
        'SELECT id FROM itinerary_events WHERE id = ?;',
        [eventId]
      )
      if (existingEvent.length === 0) {
        throw new NotFoundError(`Event with id ${eventId} not found`)
      }

      const updateFields = []
      const queryParams = []

      if (updatedEventData.label) {
        updateFields.push('label = ?')
        queryParams.push(updatedEventData.label)
      }
      if (updatedEventData.description) {
        updateFields.push('description = ?')
        queryParams.push(updatedEventData.description)
      }
      if (updatedEventData.content) {
        updateFields.push('content = ?')
        queryParams.push(updatedEventData.content)
      }
      if (updatedEventData.image) {
        updateFields.push('image = ?')
        queryParams.push(updatedEventData.image)
      }

      queryParams.push(eventId)

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE itinerary_events
                            SET ${updateFields.join(', ')}
                            WHERE id = ?;`

        const [updateResult] = await connection.query(updateQuery, queryParams)
        if (updateResult.affectedRows === 0) {
          throw new DatabaseError('Failed to update event: ' + updateResult.message)
        }
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error updating event: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async updateEventOrder ({ reorderedEvents }) {
    const connection = await getConnection()
    try {
      await connection.beginTransaction()

      for (const e of reorderedEvents) {
        const eventId = e.id
        const orderIndex = e.orderIndex
        const [updateResult] = await connection.query(
          'UPDATE itinerary_events SET order_index = ? WHERE id = ?;',
          [orderIndex, eventId]
        )
        if (updateResult.affectedRows === 0) {
          throw new DatabaseError('Failed to update event order: ' + updateResult.message)
        }
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw new DatabaseError('Error updating event order: ' + error.message)
    } finally {
      connection.release()
    }
  }
  */
}
