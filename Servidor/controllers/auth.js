import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { validateUser, validatePartialUser } from '../schemas/users.js'
import { JWT_SECRET } from '../consts/consts.js'

export class AuthController {
  constructor ({ userModel }) {
    this.userModel = userModel
  }

  register = async (req, res) => {
    const result = validateUser(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newUser = await this.userModel.create({ input: result.data })

    res.status(201).json(newUser)
  }

  login = async (req, res) => {
    const result = validatePartialUser(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { username, password } = result.data
    const user = await this.userModel.getByUsername({ username })

    const passwordCorrect = user === null
      ? false
      : await bcrypt.compare(password, user.password_hash)

    if (!(user && passwordCorrect)) {
      return res.status(401).json({
        error: 'Invalid user or password'
      })
    }

    const tokenPayload = {
      id: user.id,
      username: user.username
    }

    const accessToken = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      {
        expiresIn: '1h'
      }
    )

    const refreshToken = jwt.sign(
      tokenPayload,
      JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60
    }).cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/auth/refresh-token',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }).json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      followers: user.followers,
      following: user.following
    })
  }

  logout = async (req, res) => {
    res.clearCookie('access_token').json({ message: 'Logout' })
  }

  refreshToken = async (req, res) => {
    const refreshToken = req.cookies.refresh_token

    try {
      const data = jwt.verify(refreshToken, JWT_SECRET)

      const newAccessToken = jwt.sign(
        data.tokenPayload,
        JWT_SECRET,
        {
          expiresIn: '1h'
        }
      )

      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60
      }).end()
    } catch (error) {
      res.status(401).json({ message: 'Invalid refresh token' })
    }
  }
}
