import { InvalidInputError, UnauthorizedError } from '../errors/errors.js'
import { validateItinerary, validatePartialItinerary } from '../schemas/itineraries.js'

export class ItineraryController {
  constructor ({ itineraryModel }) {
    this.itineraryModel = itineraryModel
  }

  getAll = async (req, res, next) => {
    const { location, userId, likedBy, sort } = req.query
    try {
      const itineraries = await this.itineraryModel.getAll({ location, userId, likedBy, sort })
      res.json(itineraries)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req, res, next) => {
    const { id } = req.params
    try {
      if (!id) throw new InvalidInputError('Id parameter is required')
      const itinerary = await this.itineraryModel.getById({ id })
      res.json(itinerary)
    } catch (error) {
      next(error)
    }
  }

  create = async (req, res, next) => {
    const { user } = req.session
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')

      const result = validateItinerary(req.body)

      if (!result.success) {
        throw new InvalidInputError('Invalid itinerary data: ' + JSON.stringify(result.error.message))
      }

      if (user.id !== req.body.userId) {
        throw new UnauthorizedError('You are not authorized to create an itinerary for another user')
      }

      const itineraryId = await this.itineraryModel.create({ input: result.data })

      const locationUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${itineraryId}`

      res.status(201).set('Location', locationUrl).end()
    } catch (error) {
      next(error)
    }
  }

  delete = async (req, res, next) => {
    const { user } = req.session
    const { id } = req.params
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!id) throw new InvalidInputError('Id parameter is required')

      const itinerary = await this.itineraryModel.getById({ id })
      if (itinerary.userId !== user.id) {
        throw new UnauthorizedError('You are not authorized to delete this itinerary')
      }

      await this.itineraryModel.delete({ id })
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  update = async (req, res, next) => {
    const { user } = req.session
    const { id } = req.params
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!id) throw new InvalidInputError('Id parameter is required')

      const result = validatePartialItinerary(req.body)

      if (!result.success) {
        throw new InvalidInputError('Invalid itinerary data: ' + JSON.stringify(result.error.message))
      }

      const itinerary = await this.itineraryModel.getById({ id })
      if (itinerary.userId !== user.id) {
        throw new UnauthorizedError('You are not authorized to update this itinerary')
      }

      await this.itineraryModel.update({ id, input: result.data })
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  like = async (req, res, next) => {
    const { user } = req.session
    const itineraryId = req.params.id
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!itineraryId) throw new InvalidInputError('Itinerary id parameter is required')

      const userId = user.id

      await this.itineraryModel.likeItinerary(userId, itineraryId)
      res.end()
    } catch (error) {
      next(error)
    }
  }

  unlike = async (req, res, next) => {
    const { user } = req.session
    const itineraryId = req.params.id
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!itineraryId) throw new InvalidInputError('Itinerary id parameter is required')

      const userId = user.id

      await this.itineraryModel.unlikeItinerary(userId, itineraryId)
      res.end()
    } catch (error) {
      next(error)
    }
  }

  liked = async (req, res, next) => {
    const { userId } = req.query
    const itineraryId = req.params.id
    try {
      if (!userId) throw new InvalidInputError('User id parameter is required')
      if (!itineraryId) throw new InvalidInputError('Itinerary id parameter is required')

      const result = await this.itineraryModel.likedItinerary(userId, itineraryId)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }
}
