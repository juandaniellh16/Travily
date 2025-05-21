import { InvalidInputError, UnauthorizedError } from '../errors/errors.js'
import { validateUpdateUser } from '../schemas/updateUser.js'
import { isUUID } from '../utils/utils.js'

export class UserController {
  constructor({ userModel }) {
    this.userModel = userModel
  }

  getAll = async (req, res, next) => {
    const { name, username, limit = 10 } = req.query
    try {
      const limitValue = parseInt(limit, 10)
      const users = await this.userModel.getAll({
        name,
        username,
        limit: limitValue
      })
      res.json(users)
    } catch (error) {
      next(error)
    }
  }

  getSuggestedUsers = async (req, res, next) => {
    const { user } = req.session
    const { limit = 5 } = req.query
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      const limitValue = parseInt(limit, 10)
      const users = await this.userModel.getSuggestedUsers({
        userId: user.sub,
        limit: limitValue
      })
      res.json(users)
    } catch (error) {
      next(error)
    }
  }

  getByIdOrUsername = async (req, res, next) => {
    const { user: authUser } = req.session
    const { identifier } = req.params
    const { includeEmail } = req.query
    const includeEmailBool = includeEmail === 'true'

    try {
      if (!identifier) throw new InvalidInputError('Identifier parameter is required')

      let user
      if (isUUID(identifier)) {
        user = await this.userModel.getById({
          id: identifier,
          includeEmail: includeEmailBool
        })
      } else {
        user = await this.userModel.getByUsername({
          username: identifier,
          includeEmail: includeEmailBool
        })
      }

      if (includeEmailBool && authUser.sub !== user.id) {
        throw new UnauthorizedError('Access not authorized')
      }

      res.json(user)
    } catch (error) {
      next(error)
    }
  }

  create = async (req, res, next) => {
    try {
      const result = validateCreateUser(req.body)

      if (!result.success) {
        throw new InvalidInputError('Invalid user data: ' + JSON.stringify(result.error.message))
      }

      const userId = await this.userModel.create({ input: result.data })

      const locationUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${userId}`

      res.status(201).set('Location', locationUrl).end()
    } catch (error) {
      next(error)
    }
  }

  delete = async (req, res, next) => {
    const { user } = req.session
    const { id } = req.params
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!id) throw new InvalidInputError('Id parameter is required')
      if (user.sub !== id) {
        throw new UnauthorizedError('You are not authorized to delete this user')
      }
      await this.userModel.delete({ id })
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  update = async (req, res, next) => {
    const { user } = req.session
    const { id } = req.params
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!id) throw new InvalidInputError('Id parameter is required')

      const result = validateUpdateUser(req.body)

      if (!result.success) {
        throw new InvalidInputError('Invalid user data: ' + JSON.stringify(result.error.message))
      }

      if (user.sub !== id) {
        throw new UnauthorizedError('You are not authorized to update this user')
      }

      await this.userModel.update({ id, input: result.data })
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  follow = async (req, res, next) => {
    const { user } = req.session
    const userId = req.params.id
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!userId) throw new InvalidInputError('User id parameter is required')

      const followerId = user.sub

      if (userId === followerId) {
        throw new InvalidInputError('You cannot follow yourself')
      }

      await this.userModel.followUser({ userId, followerId })
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  unfollow = async (req, res, next) => {
    const { user } = req.session
    const userId = req.params.id
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!userId) throw new InvalidInputError('User id parameter is required')

      const followerId = user.sub

      if (userId === followerId) {
        throw new InvalidInputError('You cannot unfollow yourself')
      }

      await this.userModel.unfollowUser({ userId, followerId })
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  checkIfFollowing = async (req, res, next) => {
    const { user } = req.session
    const userId = req.params.id
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!userId) throw new InvalidInputError('User id parameter is required')

      const followerId = user.sub

      const result = await this.userModel.checkIfFollowing({
        userId,
        followerId
      })
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  getFollowers = async (req, res, next) => {
    const { user } = req.session
    const { id } = req.params
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!id) throw new InvalidInputError('Id parameter is required')

      const currentUserId = user.sub

      const users = await this.userModel.getFollowers({ id, currentUserId })
      res.json(users)
    } catch (error) {
      next(error)
    }
  }

  getFollowing = async (req, res, next) => {
    const { user } = req.session
    const { id } = req.params
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!id) throw new InvalidInputError('Id parameter is required')

      const currentUserId = user.sub

      const users = await this.userModel.getFollowing({ id, currentUserId })
      res.json(users)
    } catch (error) {
      next(error)
    }
  }
}
