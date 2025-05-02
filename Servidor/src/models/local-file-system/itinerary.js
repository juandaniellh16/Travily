import { randomUUID } from 'node:crypto'
import { readJSON } from './utils.js'

const itineraries = readJSON('./itineraries.json')

export class ItineraryModel {
  static async getAll({ location }) {
    if (location) {
      return itineraries.filter((itinerary) =>
        itinerary.locations.some((l) => l.toLowerCase() === location.toLowerCase())
      )
    }

    return itineraries
  }

  static async getById({ id }) {
    const itinerary = itineraries.find((itinerary) => itinerary.id === id)
    return itinerary
  }

  static async create({ input }) {
    const newItinerary = {
      id: randomUUID(),
      ...input
    }

    itineraries.push(newItinerary)

    return newItinerary
  }

  static async delete({ id }) {
    const itineraryIndex = itineraries.findIndex((itinerary) => itinerary.id === id)
    if (itineraryIndex === -1) return false

    itineraries.splice(itineraryIndex, 1)
    return true
  }

  static async update({ id, input }) {
    const itineraryIndex = itineraries.findIndex((itinerary) => itinerary.id === id)
    if (itineraryIndex === -1) return false

    itineraries[itineraryIndex] = {
      ...itineraries[itineraryIndex],
      ...input
    }

    return itineraries[itineraryIndex]
  }
}
