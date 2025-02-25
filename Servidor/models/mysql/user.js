import bcrypt from 'bcrypt'
import { SALT_ROUNDS } from '../../config/config.js'
import { getConnection } from '../../config/db.js'
import { UsernameConflictError, EmailConflictError, DatabaseError, NotFoundError } from '../../errors/errors.js'

export class UserModel {
  static async getAll () {
    const connection = await getConnection()
    try {
      const [users] = await connection.query(
        'SELECT BIN_TO_UUID(id) id, name, username, avatar, followers, following FROM users;'
      )

      return users
    } catch (error) {
      throw new DatabaseError('Error while fetching users: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async getById ({ id, includePassword = false, includeEmail = false }) {
    const connection = await getConnection()

    try {
      const [users] = await connection.query(
        `SELECT 
          BIN_TO_UUID(id) id, 
          name, 
          username, 
          avatar, 
          followers, 
          following 
          ${includeEmail ? ', email' : ''} 
          ${includePassword ? ', password_hash' : ''}  
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

  static async getByUsername ({ username, includePassword = false, includeEmail = false }) {
    const connection = await getConnection()

    try {
      const [users] = await connection.query(
        `SELECT 
          BIN_TO_UUID(id) id, 
          name, 
          username, 
          avatar, 
          followers, 
          following
          ${includeEmail ? ', email' : ''} 
          ${includePassword ? ', password_hash' : ''} 
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

  static async getByEmail ({ email, includePassword = false, includeEmail = false }) {
    const connection = await getConnection()

    try {
      const [users] = await connection.query(
        `SELECT 
          BIN_TO_UUID(id) id, 
          name, 
          username, 
          avatar, 
          followers, 
          following
          ${includeEmail ? ', email' : ''} 
          ${includePassword ? ', password_hash' : ''} 
        FROM users 
        WHERE email = ?;`,
        [email]
      )

      if (users.length === 0) throw new NotFoundError(`User with email ${email} not found`)

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
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE username = ?;',
        [username]
      )
      if (existingUser.length > 0) {
        throw new UsernameConflictError('Username already used')
      }

      const [existingEmail] = await connection.query(
        'SELECT id FROM users WHERE email = ?;',
        [email]
      )
      if (existingEmail.length > 0) {
        throw new EmailConflictError('Email already used')
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
      if (error instanceof UsernameConflictError || error instanceof EmailConflictError) {
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
        'SELECT id FROM users WHERE id = UUID_TO_BIN(?);',
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

  static async followUser ({ userId, followerId }) {
    const connection = await getConnection()

    try {
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE id = UUID_TO_BIN(?);',
        [userId]
      )
      if (existingUser.length === 0) {
        throw new NotFoundError(`User with id ${userId} not found`)
      }

      await connection.beginTransaction()

      const [result] = await connection.query(
        'INSERT IGNORE INTO followers (follower_id, following_id) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?));',
        [followerId, userId]
      )
      if (result.affectedRows > 0) {
        await connection.query(
          'UPDATE users SET followers = followers + 1 WHERE id = UUID_TO_BIN(?);',
          [userId]
        )
        await connection.query(
          'UPDATE users SET following = following + 1 WHERE id = UUID_TO_BIN(?);',
          [followerId]
        )
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error following user: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async unfollowUser ({ userId, followerId }) {
    const connection = await getConnection()

    try {
      const [existingUser] = await connection.query(
        'SELECT id FROM users WHERE id = UUID_TO_BIN(?);',
        [userId]
      )
      if (existingUser.length === 0) {
        throw new NotFoundError(`User with id ${userId} not found`)
      }

      await connection.beginTransaction()

      const [result] = await connection.query(
        'DELETE FROM followers WHERE follower_id = UUID_TO_BIN(?) AND following_id = UUID_TO_BIN(?);',
        [followerId, userId]
      )
      if (result.affectedRows > 0) {
        await connection.query(
          'UPDATE users SET followers = followers - 1 WHERE id = UUID_TO_BIN(?);',
          [userId]
        )
        await connection.query(
          'UPDATE users SET following = following - 1 WHERE id = UUID_TO_BIN(?);',
          [followerId]
        )
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      if (error instanceof NotFoundError) {
        throw error
      } else {
        throw new DatabaseError('Error unfollowing user: ' + error.message)
      }
    } finally {
      connection.release()
    }
  }

  static async checkIfFollowing ({ userId, followerId }) {
    const connection = await getConnection()
    try {
      const [result] = await connection.query(
        'SELECT COUNT(*) AS isFollowing FROM followers WHERE follower_id = UUID_TO_BIN(?) AND following_id = UUID_TO_BIN(?);',
        [followerId, userId]
      )

      return { isFollowing: result[0].isFollowing > 0 }
    } catch (error) {
      throw new DatabaseError('Error checking if following user: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async getFollowers ({ id, currentUserId }) {
    const connection = await getConnection()
    try {
      let queryParams = [id]
      let query = `
        SELECT 
        BIN_TO_UUID(u.id) as id, 
        u.name, 
        u.username, 
        u.avatar,
        u.followers,
        u.following,
      `

      if (currentUserId) {
        query += `
          EXISTS(
            SELECT 1 FROM followers f 
            WHERE f.follower_id = UUID_TO_BIN(?) 
            AND f.following_id = u.id
          ) as isFollowing
        `
        queryParams = [currentUserId, id]
      } else {
        query += ' FALSE as isFollowing'
      }

      query += `
        FROM followers f
        JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = UUID_TO_BIN(?);`

      const [users] = await connection.query(query, queryParams)
      return users
    } catch (error) {
      throw new DatabaseError('Error getting followers: ' + error.message)
    } finally {
      connection.release()
    }
  }

  static async getFollowing ({ id, currentUserId }) {
    const connection = await getConnection()
    try {
      let queryParams = [id]
      let query = `
        SELECT 
        BIN_TO_UUID(u.id) as id, 
        u.name, 
        u.username, 
        u.avatar,
        u.followers,
        u.following,
      `

      if (currentUserId) {
        query += `
          EXISTS(
            SELECT 1 FROM followers f 
            WHERE f.follower_id = UUID_TO_BIN(?) 
            AND f.following_id = u.id
          ) as isFollowing
        `
        queryParams = [currentUserId, id]
      } else {
        query += ' FALSE as isFollowing'
      }

      query += `
        FROM followers f
        JOIN users u ON f.following_id = u.id
        WHERE f.follower_id = UUID_TO_BIN(?);`

      const [users] = await connection.query(query, queryParams)
      return users
    } catch (error) {
      throw new DatabaseError('Error getting following: ' + error.message)
    } finally {
      connection.release()
    }
  }
}
