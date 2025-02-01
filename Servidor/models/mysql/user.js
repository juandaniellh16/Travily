import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from '../../consts/consts.js'
import { getConnection } from '../../db.js'

export class UserModel {
  static async getAll () {
    const connection = await getConnection()
    try {
      const [users] = await connection.query(
        'SELECT BIN_TO_UUID(id) id, name, username, email, avatar, followers, following FROM users;'
      )

      return users
    } catch (e) {
      throw new Error('Error creating user')
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

      if (users.length === 0) return null

      return users[0]
    } catch (e) {
      throw new Error('Error getting user by id')
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

      if (users.length === 0) return null

      return users[0]
    } catch (e) {
      throw new Error('Error getting user by username')
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

    const user = await this.getByUsername({ username })
    if (user) {
      throw new Error('Username already exists')
    }

    const connection = await getConnection()

    try {
      const [existingEmails] = await connection.query(
        'SELECT BIN_TO_UUID(id) id FROM users WHERE email = ?;',
        [email]
      )
      if (existingEmails.length > 0) {
        throw new Error('Email already used')
      }

      const passwordHash = await bcrypt.hash(password, parseInt(SALT_ROUNDS))
      const uuid = crypto.randomUUID()

      await connection.query(
        `INSERT INTO users (id, name, username, email, password_hash, avatar)
        VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?);`,
        [uuid, name, username, email, passwordHash, avatar]
      )

      return { id: uuid, name, username, email, avatar, followers: 0, following: 0 }
    } catch (e) {
      throw new Error('Error creating user')
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
      return result.affectedRows > 0
    } catch (e) {
      throw new Error('Error deleting user')
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
      await connection.beginTransaction()

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

        await connection.query(updateQuery, queryParams)
      }

      const [users] = await connection.query(
        `SELECT BIN_TO_UUID(id) id, name, username, email, password_hash, avatar, followers, following 
        FROM users 
        WHERE id = UUID_TO_BIN(?);`,
        [id]
      )

      return users[0]
    } catch (e) {
      throw new Error('Error updating user')
    } finally {
      connection.release()
    }
  }
}
