import { InvalidInputError, UnauthorizedError } from '../errors/errors.js'
import { validateItinerary, validatePartialItinerary } from '../schemas/itineraries.js'

export class ItineraryController {
  constructor({ itineraryModel }) {
    this.itineraryModel = itineraryModel
  }

  getAll = async (req, res, next) => {
    const { user } = req.session
    const {
      location,
      userId,
      username,
      role,
      likedBy,
      followedBy,
      visibility = 'public',
      sort,
      limit = 10
    } = req.query
    try {
      if (userId && username) {
        throw new InvalidInputError('You cannot filter by userId and username at the same time')
      }
      if (followedBy && (!user || user.sub !== followedBy)) {
        throw new UnauthorizedError(
          "You are not authorized to view itineraries from another user's following list"
        )
      }
      if (visibility !== 'public' && !user) {
        throw new UnauthorizedError('You are not authorized to view private itineraries')
      }
      const limitValue = parseInt(limit, 10)
      const itineraries = await this.itineraryModel.getAll({
        location,
        userId,
        username,
        role,
        likedBy,
        followedBy,
        visibility,
        sort,
        limit: limitValue,
        userIdSession: user?.sub
      })
      res.json(itineraries)
    } catch (error) {
      next(error)
    }
  }

  getById = async (req, res, next) => {
    const { user } = req.session
    const { id } = req.params
    try {
      if (!id) throw new InvalidInputError('Id parameter is required')

      const itinerary = await this.itineraryModel.getById({ id })

      if (!itinerary.isPublic) {
        if (
          !user ||
          !(await this.itineraryModel.checkIfCollaborator({
            itineraryId: id,
            userId: user.sub
          }))
        ) {
          throw new UnauthorizedError('You are not authorized to view this itinerary')
        }
      }

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
        throw new InvalidInputError(
          'Invalid itinerary data: ' + JSON.stringify(result.error.message)
        )
      }

      if (user.sub !== req.body.userId) {
        throw new UnauthorizedError(
          'You are not authorized to create an itinerary for another user'
        )
      }

      const itineraryId = await this.itineraryModel.create({
        input: result.data
      })

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
      if (itinerary.userId !== user.sub) {
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
        throw new InvalidInputError(
          'Invalid itinerary data: ' + JSON.stringify(result.error.message)
        )
      }

      const itinerary = await this.itineraryModel.getById({ id })
      if (itinerary.userId !== user.sub) {
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

      const userId = user.sub

      await this.itineraryModel.likeItinerary({ userId, itineraryId })
      res.status(204).end()
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

      const userId = user.sub

      await this.itineraryModel.unlikeItinerary({ userId, itineraryId })
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  checkIfLiked = async (req, res, next) => {
    const { user } = req.session
    const itineraryId = req.params.id
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!itineraryId) throw new InvalidInputError('Itinerary id parameter is required')

      const userId = user.sub

      const result = await this.itineraryModel.checkIfLiked({
        itineraryId,
        userId
      })
      res.json({ isLiked: result })
    } catch (error) {
      next(error)
    }
  }

  addCollaborator = async (req, res, next) => {
    const { user } = req.session
    const itineraryId = req.params.id
    try {
      if (!user) throw new UnauthorizedError('Access not authorized')
      if (!itineraryId) throw new InvalidInputError('Itinerary id parameter is required')

      const { username } = req.body
      if (!username) throw new InvalidInputError('Username parameter is required')

      await this.itineraryModel.addCollaborator({
        itineraryId,
        username,
        userIdSession: user.sub
      })
      res.status(204).end()
    } catch (error) {
      next(error)
    }
  }

  getCollaborators = async (req, res, next) => {
    const { user } = req.session
    const itineraryId = req.params.id
    try {
      if (!itineraryId) throw new InvalidInputError('Itinerary id parameter is required')
      const collaborators = await this.itineraryModel.getCollaborators({
        itineraryId,
        userIdSession: user?.sub
      })
      res.json(collaborators)
    } catch (error) {
      next(error)
    }
  }

  checkIfCollaborator = async (req, res, next) => {
    const { user } = req.session
    const itineraryId = req.params.id
    try {
      if (!user)
        throw new UnauthorizedError('You must be logged in to check if you are a collaborator')
      if (!itineraryId) throw new InvalidInputError('Itinerary id parameter is required')

      const userId = user.sub

      const result = await this.itineraryModel.checkIfCollaborator({
        itineraryId,
        userId
      })
      res.json({ isCollaborator: result })
    } catch (error) {
      next(error)
    }
  }
}
