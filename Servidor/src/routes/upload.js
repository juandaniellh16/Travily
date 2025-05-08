import { Router } from 'express'
import { upload } from '../middlewares/upload.js'

export const uploadRouter = Router()

uploadRouter.post('/avatar', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const avatarUrl = req.file.path
  res.json({ avatarUrl })
})

uploadRouter.post('/itinerary-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const itineraryImageUrl = req.file.path
  res.json({ itineraryImageUrl })
})

uploadRouter.post('/event-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const eventImageUrl = req.file.path
  res.json({ eventImageUrl })
})

uploadRouter.post('/list-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }
  const listImageUrl = req.file.path
  res.json({ listImageUrl })
})
