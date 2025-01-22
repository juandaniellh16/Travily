import express, { json } from 'express'
import { corsMiddleware } from './middlewares/cors.js'
import { itinerariesRouter } from './routes/itineraries.js'

const app = express()
app.use(json())
app.use(corsMiddleware())
app.disable('x-powered-by')

app.use('/itineraries', itinerariesRouter)

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
