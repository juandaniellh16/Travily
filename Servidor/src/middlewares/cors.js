import cors from 'cors'
import { FRONTEND_URL } from '../../config/config.js'

export const ACCEPTED_ORIGINS = [FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173']

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
