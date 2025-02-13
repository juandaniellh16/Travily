import mysql from 'mysql2/promise'
import { DATABASE_URL } from './config.js'

const connectionString = DATABASE_URL

const pool = mysql.createPool(connectionString)

export const getConnection = async () => {
  try {
    const connection = await pool.getConnection()
    return connection
  } catch (error) {
    console.error('Error connecting to the database: ', error)
    throw error
  }
}
