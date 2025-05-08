import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../../config/cloudinary.js'

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    let folder = 'others'
    let transformation = [{ width: 500, height: 500, crop: 'limit' }]

    if (req.url.includes('/avatar')) {
      folder = 'avatars'
      transformation = [{ width: 200, height: 200, crop: 'limit' }]
    } else if (req.url.includes('/itinerary-image')) {
      folder = 'itineraries'
      transformation = [{ width: 1000, height: 700, crop: 'limit' }]
    } else if (req.url.includes('/event-image')) {
      folder = 'events'
      transformation = [{ width: 500, height: 500, crop: 'limit' }]
    } else if (req.url.includes('/list-image')) {
      folder = 'lists'
      transformation = [{ width: 1000, height: 700, crop: 'limit' }]
    }

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation,
      public_id: file.originalname
    }
  }
})

export const upload = multer({ storage })
