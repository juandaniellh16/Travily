import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../consts/consts.js'

export const auth = (req, res, next) => {
  const accessToken = req.cookies.access_token
  req.session = { user: null }

  try {
    const data = jwt.verify(accessToken, JWT_SECRET)
    req.session.user = data
  } catch {}

  next()
}
