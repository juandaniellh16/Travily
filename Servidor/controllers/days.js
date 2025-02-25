import { InvalidInputError, NotFoundError } from '../errors/errors.js'
import { validateDay } from '../schemas/days.js'

export class DayController {
  constructor ({ dayModel }) {
    this.dayModel = dayModel
  }

  addDay = async ({ itineraryId, day }) => {
    const result = validateDay(day)

    if (!result.success) {
      throw new InvalidInputError('Invalid day data: ' + JSON.stringify(result.error.message))
    }

    const createdDay = await this.dayModel.addDay({ itineraryId, day: result.data })
    return createdDay
  }

  deleteDay = async ({ dayId }) => {
    const result = await this.dayModel.deleteDay({ dayId })

    if (result === false) {
      throw new NotFoundError('Day not found')
    }
  }

  updateDays = async ({ days }) => {
    if (!days || days.length === 0) return

    await this.dayModel.updateDays({ days })
  }

  /*
  updateEvent = async ({ eventId, updatedEventData }) => {
    const result = validatePartialEvent(updatedEventData)

    if (!result.success) {
      throw new InvalidInputError('Invalid event data: ' + JSON.stringify(result.error.message))
    }

    await this.eventModel.updateEvent({ eventId, updatedEventData: result.data })
  }

  reorderEvents = async ({ events }) => {
    await this.eventModel.updateEventOrder({ reorderedEvents: events })
  } */
}
