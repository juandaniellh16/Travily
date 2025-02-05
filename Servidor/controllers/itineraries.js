import { validateItinerary, validatePartialItinerary } from '../schemas/itineraries.js'

export class ItineraryController {
  constructor ({ itineraryModel }) {
    this.itineraryModel = itineraryModel
  }

  getAll = async (req, res) => {
    const { location } = req.query
    const itineraries = await this.itineraryModel.getAll({ location })
    res.json(itineraries)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const itinerary = await this.itineraryModel.getById({ id })
    if (itinerary) return res.json(itinerary)
    res.status(404).json({ message: 'Itinerary not found' })
  }

  getPopular = async (req, res) => {
    const itineraries = await this.itineraryModel.getPopular()
    res.json(itineraries)
  }

  getUserItineraries = async (req, res) => {
    const { userId } = req.params

    try {
      const itineraries = await this.itineraryModel.getUserItineraries({ userId })
      res.json(itineraries)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Error getting user itineraries' })
    }
  }

  getUserLikedItineraries = async (req, res) => {
    const { userId } = req.params

    try {
      const itineraries = await this.itineraryModel.getUserLikedItineraries({ userId })
      res.json(itineraries)
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message })
      }
      res.status(500).json({ message: 'Error getting user liked itineraries' })
    }
  }

  create = async (req, res) => {
    const { user } = req.session
    if (!user) return res.status(401).json({ message: 'Access not authorized' })

    const result = validateItinerary(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newItinerary = await this.itineraryModel.create({ input: result.data })

    res.status(201).json(newItinerary)
  }

  delete = async (req, res) => {
    const { id } = req.params

    const result = await this.itineraryModel.delete({ id })

    if (result === false) {
      return res.status(404).json({ message: 'Itinerary not found' })
    }

    return res.json({ message: 'Itinerary deleted' })
  }

  update = async (req, res) => {
    const result = validatePartialItinerary(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params

    const updatedItinerary = await this.itineraryModel.update({ id, input: result.data })

    return res.json(updatedItinerary)
  }

  like = async (req, res) => {
    const { user } = req.session
    if (!user) return res.status(401).json({ message: 'Access not authorized' })

    const { userId } = req.body
    const itineraryId = req.params.id

    try {
      const result = await this.itineraryModel.likeItinerary(userId, itineraryId)
      res.json(result)
    } catch {
      res.status(400).json({ message: 'Error liking itinerary' })
    }
  }

  unlike = async (req, res) => {
    const { user } = req.session
    if (!user) return res.status(401).json({ message: 'Access not authorized' })

    const { userId } = req.body
    const itineraryId = req.params.id

    try {
      const result = await this.itineraryModel.unlikeItinerary(userId, itineraryId)
      res.json(result)
    } catch {
      res.status(400).json({ message: 'Error unliking itinerary' })
    }
  }

  liked = async (req, res) => {
    const { userId } = req.query
    const itineraryId = req.params.id

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' })
    }

    try {
      const result = await this.itineraryModel.likedItinerary(userId, itineraryId)
      res.json(result)
    } catch {
      res.status(400).json({ message: 'Error checking if itinerary is liked' })
    }
  }
}
