import { Router } from 'express'
import { ItineraryController } from '../controllers/itineraries.js'

export const createItinerariesRouter = ({ itineraryModel }) => {
  const itinerariesRouter = Router()

  const itineraryController = new ItineraryController({ itineraryModel })

  itinerariesRouter.get('/', itineraryController.getAll)
  itinerariesRouter.post('/', itineraryController.create)
  itinerariesRouter.get('/:id', itineraryController.getById)
  itinerariesRouter.delete('/:id', itineraryController.delete)
  itinerariesRouter.patch('/:id', itineraryController.update)

  itinerariesRouter.post('/:id/likes', itineraryController.like)
  itinerariesRouter.delete('/:id/likes', itineraryController.unlike)
  itinerariesRouter.get('/:id/liked', itineraryController.liked)

  return itinerariesRouter
}
