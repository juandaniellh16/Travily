import { Router } from 'express'
import { API_BASE_URL } from '../config/config.js'
import { upload } from '../middlewares/upload.js'

export const uploadRouter = Router()

uploadRouter.post('/avatar', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const avatarUrl = `${API_BASE_URL}/uploads/avatars/${req.file.filename}`
  res.json({ avatarUrl })
})

uploadRouter.post('/itinerary-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const itineraryImageUrl = `${API_BASE_URL}/uploads/itineraries/${req.file.filename}`
  res.json({ itineraryImageUrl })
})

uploadRouter.post('/event-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const eventImageUrl = `${API_BASE_URL}/uploads/events/${req.file.filename}`
  res.json({ eventImageUrl })
})
