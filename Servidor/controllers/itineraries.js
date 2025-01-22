import { ItineraryModel } from '../models/mysql/itinerary.js'
import { validateItinerary, validatePartialItinerary } from '../schemas/itineraries.js'

export class ItineraryController {
  static async getAll (req, res) {
    const { location } = req.query
    const itineraries = await ItineraryModel.getAll({ location })
    res.json(itineraries)
  }

  static async getById (req, res) {
    const { id } = req.params
    const itinerary = await ItineraryModel.getById({ id })
    if (itinerary) return res.json(itinerary)
    res.status(404).json({ message: 'Itinerary not found' })
  }

  static async create (req, res) {
    const result = validateItinerary(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newItinerary = await ItineraryModel.create({ input: result.data })

    res.status(201).json(newItinerary)
  }

  static async delete (req, res) {
    const { id } = req.params

    const result = await ItineraryModel.delete({ id })

    if (result === false) {
      return res.status(404).json({ message: 'Itinerary not found' })
    }

    return res.json({ message: 'Itinerary deleted' })
  }

  static async update (req, res) {
    const result = validatePartialItinerary(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params

    const updatedItinerary = await ItineraryModel.update({ id, input: result.data })

    return res.json(updatedItinerary)
  }
}
