import multer from 'multer'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = 'src/uploads/others'

    if (req.url.includes('/avatar')) {
      uploadDir = 'src/uploads/avatars'
    } else if (req.url.includes('/itinerary-image')) {
      uploadDir = 'src/uploads/itineraries'
    } else if (req.url.includes('/event-image')) {
      uploadDir = 'src/uploads/events'
    } else if (req.url.includes('/list-image')) {
      uploadDir = 'src/uploads/lists'
    }

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`
    cb(null, filename)
  }
})

export const upload = multer({ storage })
