const DEFAULT_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'itineraries_db'
}
export const DATABASE_URL = process.env.DATABASE_URL ?? DEFAULT_CONFIG
export const PORT = process.env.PORT || 3000
export const JWT_SECRET = process.env.JWT_SECRET
export const SALT_ROUNDS = process.env.SALT_ROUNDS || 10
