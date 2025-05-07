import dotenv from 'dotenv'

dotenv.config()

export const PORT = process.env.PORT || 3000
export const API_BASE_URL = process.env.API_BASE_URL

const DEFAULT_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'itineraries_db'
}

export const FRONTEND_URL = process.env.FRONTEND_URL

export const DATABASE_URL = process.env.DATABASE_URL ?? DEFAULT_CONFIG
export const JWT_SECRET = process.env.JWT_SECRET
export const SALT_ROUNDS = process.env.SALT_ROUNDS || 10
