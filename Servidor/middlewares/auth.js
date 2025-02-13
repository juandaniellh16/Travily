import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/config.js'

export const auth = (req, res, next) => {
  const accessToken = req.cookies.access_token
  req.session = { user: null }

  try {
    if (accessToken) {
      const data = jwt.verify(accessToken, JWT_SECRET)
      req.session.user = data
    }
  } catch {}

  next()
}
