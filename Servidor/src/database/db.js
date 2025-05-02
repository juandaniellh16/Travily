import mysql from 'mysql2/promise'
import { DATABASE_URL } from '../../config/config.js'
import fs from 'fs'

const sslConfig = {
  ca: fs.readFileSync('./config/ca.pem')
}

const pool = mysql.createPool({
  uri: DATABASE_URL,
  ssl: sslConfig
})

export const getConnection = async () => {
  try {
    const connection = await pool.getConnection()
    return connection
  } catch (error) {
    console.error('Error connecting to the database: ', error)
    throw error
  }
}
