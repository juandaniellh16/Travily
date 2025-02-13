import { InvalidInputError, UnauthorizedError } from '../errors/errors.js'
import { validatePartialUser } from '../schemas/users.js'

export class UserController {
  constructor ({ userModel }) {
    this.userModel = userModel
  }

  getAll = async (req, res, next) => {
    try {
      const users = await this.userModel.getAll()
      res.json(users)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req, res, next) => {
    const { id } = req.params
    try {
      if (!id) throw new InvalidInputError('Id parameter is required')
      const user = await this.userModel.getById({ id })
      res.json(user)
    } catch (error) {
      next(error)
    }
  }

  getByUsername = async (req, res, next) => {
    const { username } = req.params
    try {
      if (!username) throw new InvalidInputError('Username parameter is required')
      const user = await this.userModel.getByUsername({ username })
      res.json(user)
    } catch (error) {
      next(error)
    }
  }

  /*
  create = async (req, res, next) => {
    try {
      const result = validateUser(req.body)

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
  */

  delete = async (req, res, next) => {
    const { user } = req.session
    const { id } = req.params
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!id) throw new InvalidInputError('Id parameter is required')
      if (user.id !== id) {
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

      const result = validatePartialUser(req.body)

      if (!result.success) {
        throw new InvalidInputError('Invalid user data: ' + JSON.stringify(result.error.message))
      }

      if (user.id !== id) {
        throw new UnauthorizedError('You are not authorized to update this user')
      }

      await this.userModel.update({ id, input: result.data })
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }
}
