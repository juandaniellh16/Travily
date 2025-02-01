import multer from 'multer'
import fs from 'fs'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars'
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
