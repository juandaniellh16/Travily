import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { validateCreateUser } from '../schemas/createUser.js'
import { validateLogin } from '../schemas/login.js'
import { JWT_SECRET } from '../../config/config.js'
import { InvalidInputError, UnauthorizedError } from '../errors/errors.js'

export class AuthController {
  constructor({ userModel }) {
    this.userModel = userModel
  }

  register = async (req, res, next) => {
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

  login = async (req, res, next) => {
    try {
      const result = validateLogin(req.body)

      if (!result.success) {
        throw new InvalidInputError('Invalid user data: ' + JSON.stringify(result.error.message))
      }

      const { usernameOrEmail, password } = result.data

      const isEmail = usernameOrEmail.includes('@')

      const user = isEmail
        ? await this.userModel.getByEmail({
            email: usernameOrEmail,
            includePassword: true
          })
        : await this.userModel.getByUsername({
            username: usernameOrEmail,
            includePassword: true
          })

      const passwordCorrect =
        user === null ? false : await bcrypt.compare(password, user.password_hash)

      if (!(user && passwordCorrect)) {
        throw new UnauthorizedError('Invalid user or password')
      }

      const tokenPayload = {
        id: user.id,
        username: user.username
      }

      const accessToken = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: '1h'
      })

      const refreshToken = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: '7d'
      })

      res
        .cookie('access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60
        })
        .cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/auth/refresh-token',
          maxAge: 1000 * 60 * 60 * 24 * 7
        })
        .json({
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          followers: user.followers,
          following: user.following
        })
    } catch (error) {
      next(error)
    }
  }

  logout = async (req, res) => {
    res
      .clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      .clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/auth/refresh-token'
      })
      .status(204)
      .end()
  }

  refreshToken = async (req, res, next) => {
    try {
      const refreshToken = req.cookies.refresh_token

      const data = jwt.verify(refreshToken, JWT_SECRET)

      const tokenPayload = {
        id: data.id,
        username: data.username
      }
      const newAccessToken = jwt.sign(tokenPayload, JWT_SECRET, {
        expiresIn: '1h'
      })

      res
        .cookie('access_token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 1000 * 60 * 60
        })
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }
}
