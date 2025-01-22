import { Router } from 'express'

import { ItineraryController } from '../controllers/itineraries.js'

export const itinerariesRouter = Router()

itinerariesRouter.get('/', ItineraryController.getAll)
itinerariesRouter.post('/', ItineraryController.create)

itinerariesRouter.get('/:id', ItineraryController.getById)
itinerariesRouter.delete('/:id', ItineraryController.delete)
itinerariesRouter.patch('/:id', ItineraryController.update)
