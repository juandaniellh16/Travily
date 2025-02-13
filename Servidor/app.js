import express, { json } from 'express'
import { corsMiddleware } from './middlewares/cors.js'
import cookieParser from 'cookie-parser'
import { createItinerariesRouter } from './routes/itineraries.js'
import { createUsersRouter } from './routes/users.js'
import { createAuthRouter } from './routes/auth.js'
import { uploadRouter } from './routes/upload.js'
import { ItineraryModel } from './models/mysql/itinerary.js'
import { UserModel } from './models/mysql/user.js'
import { EventModel } from './models/mysql/event.js'
import { auth } from './middlewares/auth.js'
import { PORT } from './config/config.js'
import http from 'http'
import { initializeWebSocket } from './websocket.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()
const server = http.createServer(app)
initializeWebSocket({ server, eventModel: EventModel })
app.disable('x-powered-by')
app.use(corsMiddleware())
app.use(json())
app.use(cookieParser())
app.use(auth)

app.use('/auth', createAuthRouter({ userModel: UserModel }))
app.use('/users', createUsersRouter({ userModel: UserModel }))
app.use('/itineraries', createItinerariesRouter({ itineraryModel: ItineraryModel }))

app.use('/upload', uploadRouter)
app.use('/uploads', express.static('uploads'))

app.use(errorHandler)

server.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`)
})
