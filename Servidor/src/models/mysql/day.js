import { getConnection } from '../../database/db.js'
import { DatabaseError, NotFoundError } from '../../errors/errors.js'

export class DayModel {
  static async addDay({ itineraryId, day }) {
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

  static async deleteDay({ dayId }) {
    const connection = await getConnection()
    try {
      const [result] = await connection.query('DELETE FROM itinerary_days WHERE id = ?;', [dayId])
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

  static async updateDays({ days }) {
    const connection = await getConnection()
    try {
      const dayNumberCase = days.map((day) => `WHEN id = ${day.id} THEN ${day.dayNumber}`).join(' ')

      const labelCase = days
        .map((day) => `WHEN id = ${day.id} THEN '${day.label.replace("'", "''")}'`)
        .join(' ')

      const query = `
        UPDATE itinerary_days
        SET
          day_number = CASE ${dayNumberCase} END,
          label = CASE ${labelCase} END
        WHERE id IN (${days.map((day) => day.id).join(', ')})
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
}
