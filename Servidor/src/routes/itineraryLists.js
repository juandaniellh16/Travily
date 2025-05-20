import { Router } from 'express'
import { ItineraryListController } from '../controllers/itineraryLists.js'

export const createItineraryListsRouter = ({ itineraryListModel }) => {
  const itineraryListsRouter = Router()

  const itineraryListController = new ItineraryListController({
    itineraryListModel
  })

  itineraryListsRouter.get('/', itineraryListController.getAll)
  itineraryListsRouter.post('/', itineraryListController.create)
  itineraryListsRouter.get('/:id', itineraryListController.getById)
  itineraryListsRouter.delete('/:id', itineraryListController.delete)
  itineraryListsRouter.patch('/:id', itineraryListController.update)

  itineraryListsRouter.post('/:id/likes', itineraryListController.like)
  itineraryListsRouter.delete('/:id/likes', itineraryListController.unlike)
  itineraryListsRouter.get('/:id/is-liked', itineraryListController.checkIfLiked)

  itineraryListsRouter.post('/:id/itineraries', itineraryListController.addItineraryToList)
  itineraryListsRouter.delete('/:id/itineraries', itineraryListController.removeItineraryFromList)

  return itineraryListsRouter
}
