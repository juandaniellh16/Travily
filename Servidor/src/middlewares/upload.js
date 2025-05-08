import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../../config/cloudinary.js'

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folder = 'others'

    if (req.url.includes('/avatar')) {
      folder = 'avatars'
    } else if (req.url.includes('/itinerary-image')) {
      folder = 'itineraries'
    } else if (req.url.includes('/event-image')) {
      folder = 'events'
    } else if (req.url.includes('/list-image')) {
      folder = 'lists'
    }

    return {
      folder: folder,
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
      public_id: file.originalname
    }
  }
})

export const upload = multer({ storage })
