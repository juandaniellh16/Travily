import express, { json } from 'express'
import { corsMiddleware } from './middlewares/cors.js'
import cookieParser from 'cookie-parser'
import { createItinerariesRouter } from './routes/itineraries.js'
import { createUsersRouter } from './routes/users.js'
import { createAuthRouter } from './routes/auth.js'
import { ItineraryModel } from './models/mysql/itinerary.js'
import { UserModel } from './models/mysql/user.js'
import { auth } from './middlewares/auth.js'
import { upload } from './middlewares/upload.js'
import { PORT } from './consts/consts.js'

const app = express()
app.disable('x-powered-by')
app.use(corsMiddleware())
app.use(json())
app.use(cookieParser())
app.use(auth)

app.use('/auth', createAuthRouter({ userModel: UserModel }))
app.use('/users', createUsersRouter({ userModel: UserModel }))
app.use('/itineraries', createItinerariesRouter({ itineraryModel: ItineraryModel }))

app.use('/uploads', express.static('uploads'))

app.post('/upload-avatar', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const avatarUrl = `http://localhost:${PORT}/uploads/avatars/${req.file.filename}`
  res.json({ avatarUrl })
})

app.post('/upload-itinerary', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const itineraryImageUrl = `http://localhost:${PORT}/uploads/itineraries/${req.file.filename}`
  res.json({ itineraryImageUrl })
})

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
