import cors from 'cors'

export const ACCEPTED_ORIGINS = [
  'https://z49w0n4p-5173.uks1.devtunnels.ms',
  'http://localhost:8080',
  'http://localhost:3000',
  'http://localhost:5173'
]

export const corsMiddleware = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
  origin: (origin, callback) => {
    if (acceptedOrigins.includes(origin) || !origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  },
  exposedHeaders: ['Location'],
  credentials: true
})
