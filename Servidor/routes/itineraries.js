import { Router } from 'express'
import { ItineraryController } from '../controllers/itineraries.js'

export const createItinerariesRouter = ({ itineraryModel }) => {
  const itinerariesRouter = Router()

  const itineraryController = new ItineraryController({ itineraryModel })

  itinerariesRouter.get('/', itineraryController.getAll)
  itinerariesRouter.post('/', itineraryController.create)

  itinerariesRouter.get('/popular', itineraryController.getPopular)

  itinerariesRouter.get('/:id', itineraryController.getById)
  itinerariesRouter.post('/:id/like', itineraryController.like)
  itinerariesRouter.post('/:id/unlike', itineraryController.unlike)
  itinerariesRouter.get('/:id/liked', itineraryController.liked)
  itinerariesRouter.delete('/:id', itineraryController.delete)
  itinerariesRouter.patch('/:id', itineraryController.update)

  return itinerariesRouter
}
