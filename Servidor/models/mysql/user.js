import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from '../../config/config.js'
import { getConnection } from '../../config/db.js'
import { ConflictError, DatabaseError, NotFoundError } from '../../errors/errors.js'

export class UserModel {
  static async getAll () {
    const connection = await getConnection()
    try {
      const [users] = await connection.query(
        'SELECT BIN_TO_UUID(id) id, name, username, email, avatar, followers, following FROM users;'
      )

      return users
    } catch (error) {
      throw new DatabaseError('Error while fetching users: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async getById ({ id }) {
    const connection = await getConnection()

    try {
      const [users] = await connection.query(
        `SELECT BIN_TO_UUID(id) id, name, username, email, password_hash, avatar, followers, following 
        FROM users 
        WHERE id = UUID_TO_BIN(?);`,
        [id]
      )

      if (users.length === 0) throw new NotFoundError(`User with id ${id} not found`)

      return users[0]
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new Error('Error getting user: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async getByUsername ({ username }) {
    const connection = await getConnection()

    try {
      const [users] = await connection.query(
        `SELECT BIN_TO_UUID(id) id, name, username, email, password_hash, avatar, followers, following 
        FROM users 
        WHERE username = ?;`,
        [username]
      )

      if (users.length === 0) throw new NotFoundError(`User with username ${username} not found`)

      return users[0]
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new Error('Error getting user: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async create ({ input }) {
    const {
      name,
      username,
      email,
      password,
      avatar = null
    } = input

    const connection = await getConnection()

    try {
      const user = await this.getByUsername({ username })
      if (user) {
        throw new ConflictError('Username already used')
      }

      const [existingEmail] = await connection.query(
        'SELECT BIN_TO_UUID(id) id FROM users WHERE email = ?;',
        [email]
      )
      if (existingEmail.length > 0) {
        throw new ConflictError('Email already used')
      }

      const passwordHash = await bcrypt.hash(password, parseInt(SALT_ROUNDS))
      const uuid = crypto.randomUUID()

      await connection.query(
        `INSERT INTO users (id, name, username, email, password_hash, avatar)
        VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?);`,
        [uuid, name, username, email, passwordHash, avatar]
      )

      return { id: uuid, name, username, email, avatar, followers: 0, following: 0 }
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error
      } else {
        throw new DatabaseError('Error creating user: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async delete ({ id }) {
    const connection = await getConnection()

    try {
      const [result] = await connection.query(
        'DELETE FROM users WHERE id = UUID_TO_BIN(?);',
        [id]
      )
      if (result.affectedRows === 0) {
        throw new NotFoundError(`User with id ${id} not found`)
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error deleting user: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async update ({ id, input }) {
    const {
      name,
      username,
      password,
      avatar
    } = input

    const connection = await getConnection()

    try {
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE id = ?;',
        [id]
      )
      if (existingUser.length === 0) {
        throw new NotFoundError(`User with id ${id} not found`)
      }

      const updateFields = []
      const queryParams = []

      if (name) {
        updateFields.push('name = ?')
        queryParams.push(name)
      }
      if (username) {
        updateFields.push('username = ?')
        queryParams.push(username)
      }
      if (password) {
        const passwordHash = await bcrypt.hash(password, parseInt(SALT_ROUNDS))
        updateFields.push('password = ?')
        queryParams.push(passwordHash)
      }
      if (avatar) {
        updateFields.push('avatar = ?')
        queryParams.push(avatar)
      }

      queryParams.push(id)

      if (updateFields.length > 0) {
        const updateQuery = `UPDATE users 
                            SET ${updateFields.join(', ')}
                            WHERE id = UUID_TO_BIN(?);`

        const [updateResult] = await connection.query(updateQuery, queryParams)
        if (updateResult.affectedRows === 0) {
          throw new DatabaseError('Failed to update user: ' + updateResult.message)
        }
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error updating user: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }
}
