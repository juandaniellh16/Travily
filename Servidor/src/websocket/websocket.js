import { ACCEPTED_ORIGINS } from '../middlewares/cors.js'
import { Server } from 'socket.io'
import { EventController } from '../controllers/events.js'
import { DayController } from '../controllers/days.js'

const UPDATE_INTERVAL = 15000
const itineraryUpdates = {}

export const initializeWebSocket = ({ server, dayModel, eventModel }) => {
  const io = new Server(server, {
    cors: {
      origin: ACCEPTED_ORIGINS,
      methods: ['GET', 'POST']
    }
  })

  const dayController = new DayController({ dayModel })
  const eventController = new EventController({ eventModel })

  io.on('connection', (socket) => {
    console.log('Un nuevo cliente se ha conectado')

    // El cliente se une a la sala del itinerario que está editando
    socket.on('join-itinerary', async (itineraryId) => {
      socket.join(itineraryId)
      console.log(`El cliente ${socket.id} se ha unido a la sala del itinerario: ${itineraryId}`)

      try {
        // Persistir datos pendientes antes de permitir la carga
        if (itineraryUpdates[itineraryId]) {
          const { reordered } = itineraryUpdates[itineraryId]

          if (reordered) {
            await eventController.reorderEvents({
              itineraryId,
              dayId: reordered.dayId,
              events: reordered.events
            })
          }

          delete itineraryUpdates[itineraryId]
        }

        // Avisar al cliente que la persistencia ha terminado
        socket.emit('itinerary-ready')
      } catch (error) {
        console.error('Error al persistir datos antes de cargar el itinerario:', error)
      }
    })

    // El cliente abandona la sala del itinerario que está editando
    socket.on('leave-itinerary', (itineraryId) => {
      socket.leave(itineraryId)
      console.log(`El cliente ${socket.id} ha abandonado la sala del itinerario: ${itineraryId}`)
    })

    socket.on('edit-itinerary', async ({ itineraryId, updatedItineraryData }) => {
      try {
        io.to(itineraryId).emit(`itinerary-update-${itineraryId}`, {
          action: 'edit-itinerary',
          updatedItineraryData
        })
      } catch (error) {
        console.error(`${error.name}: ${error.message}`)
        socket.emit('error', { message: error.message })
      }
    })

    socket.on('add-day', async ({ itineraryId, dayData }) => {
      try {
        const createdDay = await dayController.addDay({
          itineraryId,
          day: dayData.newDay
        })
        io.to(itineraryId).emit(`itinerary-update-${itineraryId}`, {
          action: 'add-day',
          day: createdDay
        })
      } catch (error) {
        console.error(`${error.name}: ${error.message}`)
        socket.emit('error', { message: error.message })
      }
    })

    socket.on('delete-day', async ({ itineraryId, dayId, startDate, days }) => {
      try {
        await dayController.deleteDay({ dayId })

        const updatedDays = days.map((day, index) => {
          const newDate = new Date(startDate)
          newDate.setDate(newDate.getDate() + index)

          let formattedDate = newDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
          })
          formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

          return {
            ...day,
            dayNumber: index + 1,
            label: `Día ${index + 1} - ${formattedDate}`
          }
        })

        await dayController.updateDays({ days: updatedDays })

        io.to(itineraryId).emit(`itinerary-update-${itineraryId}`, {
          action: 'delete-day',
          days: updatedDays
        })
      } catch (error) {
        console.error(`${error.name}: ${error.message}`)
        socket.emit('error', { message: error.message })
      }
    })

    socket.on('add-event', async ({ itineraryId, dayId, eventData }) => {
      try {
        const createdEvent = await eventController.addEvent({
          dayId,
          event: eventData
        })
        io.to(itineraryId).emit(`itinerary-update-${itineraryId}`, {
          action: 'add-event',
          dayId,
          event: createdEvent
        })
      } catch (error) {
        console.error(`${error.name}: ${error.message}`)
        socket.emit('error', { message: error.message })
      }
    })

    socket.on('delete-event', async ({ itineraryId, dayId, eventId }) => {
      try {
        await eventController.deleteEvent({ eventId })
        io.to(itineraryId).emit(`itinerary-update-${itineraryId}`, {
          action: 'delete-event',
          dayId,
          eventId
        })
      } catch (error) {
        console.error(`${error.name}: ${error.message}`)
        socket.emit('error', { message: error.message })
      }
    })

    socket.on('edit-event', async ({ itineraryId, dayId, eventId, updatedEventData }) => {
      try {
        await eventController.updateEvent({ eventId, updatedEventData })
        io.to(itineraryId).emit(`itinerary-update-${itineraryId}`, {
          action: 'edit-event',
          dayId,
          eventId,
          updatedEventData
        })
      } catch (error) {
        console.error(`${error.name}: ${error.message}`)
        socket.emit('error', { message: error.message })
      }
    })

    socket.on('reorder-events', ({ itineraryId, dayId, eventData }) => {
      if (!itineraryUpdates[itineraryId]) {
        itineraryUpdates[itineraryId] = { reordered: null }
      }

      itineraryUpdates[itineraryId].reordered = {
        events: eventData.reorderedEvents
      }
      io.to(itineraryId).emit(`itinerary-update-${itineraryId}`, {
        action: 'reorder-events',
        dayId,
        events: eventData.reorderedEvents
      })
    })

    socket.on('disconnect', () => {
      console.log('Un cliente se ha desconectado')
    })
  })

  setInterval(async () => {
    const itineraryIdsWithUpdates = Object.keys(itineraryUpdates).filter(
      (itineraryId) => itineraryUpdates[itineraryId]?.reordered
    )

    if (itineraryIdsWithUpdates.length === 0) return

    try {
      await Promise.all(
        itineraryIdsWithUpdates.map(async (itineraryId) => {
          const { reordered } = itineraryUpdates[itineraryId]

          if (reordered) {
            try {
              await eventController.reorderEvents({
                itineraryId,
                dayId: reordered.dayId,
                events: reordered.events
              })
              console.log(
                `Reordenaciones guardadas en la base de datos para el itinerario ${itineraryId}`
              )
            } catch (error) {
              console.error(`${error.name}: ${error.message}`)
              io.to(itineraryId).emit('error', { message: error.message })
            }
          }

          delete itineraryUpdates[itineraryId]
        })
      )
    } catch (error) {
      console.error(`${error.name}: ${error.message}`)
    }
  }, UPDATE_INTERVAL)

  return io
}
