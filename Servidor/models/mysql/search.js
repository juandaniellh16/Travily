import { getConnection } from '../../config/db.js'
import { DatabaseError } from '../../errors/errors.js'

export class SearchModel {
  static async search ({ query }) {
    const connection = await getConnection()
    try {
      const [results] = await connection.query(
        `SELECT 
            'location' AS type, 
            name FROM locations 
        WHERE name LIKE ?
        UNION 
        SELECT 
            'user' AS type,
            username FROM users
        WHERE username LIKE ? OR name LIKE ?
        LIMIT 10;`,
        [`${query}%`, `${query}%`, `${query}%`]
      )

      return results
    } catch (error) {
      throw new DatabaseError('Error executing search query: ' + error.message)
    } finally {
      connection.release()
    }
  }
}
