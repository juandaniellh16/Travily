import { ACCEPTED_ORIGINS } from './cors.js'

export const verifyOrigin = (req, res, next) => {
  const origin = req.get('Origin')

  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    return next()
  }

  return res.status(403).json({ message: 'Access denied' })
}
