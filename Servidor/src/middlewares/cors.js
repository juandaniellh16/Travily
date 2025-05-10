import cors from 'cors'
import { FRONTEND_URL } from '../../config/config.js'

const DEV_ORIGINS = ['http://localhost:3000', 'http://localhost:5173']
const PROD_ORIGINS = [FRONTEND_URL]

export const ACCEPTED_ORIGINS = process.env.NODE_ENV === 'production' ? PROD_ORIGINS : DEV_ORIGINS

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) =>
  cors({
    origin: (origin, callback) => {
      if (acceptedOrigins.includes(origin) || !origin) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    },
    exposedHeaders: ['Location'],
    credentials: true
  })
