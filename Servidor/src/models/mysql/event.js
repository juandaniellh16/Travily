import { getConnection } from '../../database/db.js'
import { DatabaseError, NotFoundError } from '../../errors/errors.js'

export class EventModel {
  static async addEvent({ dayId, event }) {
    const { orderIndex, label, description, category = 'other', image, startTime, endTime } = event
    const connection = await getConnection()
    try {
      const [result] = await connection.query(
        'INSERT INTO itinerary_events (day_id, order_index, label, description, category, image, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        [
          dayId,
          orderIndex,
          label,
          description,
          category || 'other',
          image,
          startTime || null,
          endTime || null
        ]
      )

      if (!result.insertId) {
        throw new DatabaseError('Failed to add event: ' + result.message)
      }

      const newEventId = result.insertId

      return {
        id: newEventId,
        dayId,
        orderIndex,
        label,
        description,
        category,
        image,
        startTime,
        endTime
      }
    } catch (error) {
      throw new DatabaseError('Error adding event: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async deleteEvent({ eventId }) {
    const connection = await getConnection()
    try {
      const [result] = await connection.query('DELETE FROM itinerary_events WHERE id = ?;', [
        eventId
      ])
      if (result.affectedRows === 0) {
        throw new NotFoundError(`Event with id ${eventId} not found`)
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error deleting event: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async updateEvent({ eventId, updatedEventData }) {
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
      if (updatedEventData.category) {
        updateFields.push('category = ?')
        queryParams.push(updatedEventData.category || 'other')
      }
      if (updatedEventData.image) {
        updateFields.push('image = ?')
        queryParams.push(updatedEventData.image)
      }
      if (updatedEventData.startTime) {
        updateFields.push('start_time = ?')
        queryParams.push(updatedEventData.startTime)
      }
      if (updatedEventData.endTime) {
        updateFields.push('end_time = ?')
        queryParams.push(updatedEventData.endTime)
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

  static async updateEventOrder({ reorderedEvents }) {
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
}
