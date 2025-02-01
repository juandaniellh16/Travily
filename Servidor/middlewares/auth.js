import jwt from 'jsonwebtoken'

export const auth = (req, res, next) => {
  const accessToken = req.cookies.access_token
  req.session = { user: null }

  try {
    const data = jwt.verify(accessToken, process.env.JWT_SECRET)
    req.session.user = data
  } catch {}

  next()
}
