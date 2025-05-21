import { InvalidInputError, NotFoundError } from '../errors/errors.js'
import { validateEvent, validatePartialEvent } from '../schemas/events.js'

export class EventController {
  constructor({ eventModel }) {
    this.eventModel = eventModel
  }

  addEvent = async ({ dayId, event }) => {
    const result = validateEvent(event)

    if (!result.success) {
      throw new InvalidInputError('Invalid event data: ' + JSON.stringify(result.error.message))
    }

    const createdEvent = await this.eventModel.addEvent({
      dayId,
      event: result.data
    })
    return createdEvent
  }

  deleteEvent = async ({ eventId }) => {
    const result = await this.eventModel.deleteEvent({ eventId })

    if (result === false) {
      throw new NotFoundError('Event not found')
    }
  }

  updateEvent = async ({ eventId, updatedEventData }) => {
    const result = validatePartialEvent(updatedEventData)

    if (!result.success) {
      throw new InvalidInputError('Invalid event data: ' + JSON.stringify(result.error.message))
    }

    await this.eventModel.updateEvent({
      eventId,
      updatedEventData: result.data
    })
  }

  reorderEvents = async ({ events }) => {
    await this.eventModel.updateEventOrder({ reorderedEvents: events })
  }
}
