import { ACCEPTED_ORIGINS } from './middlewares/cors.js'
import { Server } from 'socket.io'
import { EventController } from './controllers/events.js'

const UPDATE_INTERVAL = 15000
const itineraryUpdates = {}

export const initializeWebSocket = ({ server, eventModel }) => {
  const io = new Server(server, {
    cors: {
      origin: ACCEPTED_ORIGINS,
      methods: ['GET', 'POST']
    }
  })

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

    socket.on('add-event', async ({ itineraryId, dayId, eventData }) => {
      try {
        const createdEvent = await eventController.addEvent({ dayId, event: eventData.newEvent })
        io.to(itineraryId).emit(`itinerary-update-${itineraryId}`, { action: 'add-event', dayId, event: createdEvent })
      } catch (error) {
        console.error(`${error.name}: ${error.message}`)
        socket.emit('event-error', { message: error.message })
      }
    })

    socket.on('delete-event', async ({ itineraryId, dayId, eventId }) => {
      try {
        await eventController.deleteEvent({ eventId })
        io.to(itineraryId).emit(`itinerary-update-${itineraryId}`, { action: 'delete-event', dayId, eventId })
      } catch (error) {
        console.error(`${error.name}: ${error.message}`)
        socket.emit('event-error', { message: error.message })
      }
    })

    socket.on('edit-event', async ({ itineraryId, dayId, eventId, updatedEventData }) => {
      try {
        await eventController.updateEvent({ eventId, updatedEventData })
        io.to(itineraryId).emit(`itinerary-update-${itineraryId}`, { action: 'edit-event', dayId, eventId, updatedEventData })
      } catch (error) {
        console.error(`${error.name}: ${error.message}`)
        socket.emit('event-error', { message: error.message })
      }
    })

    socket.on('reorder-events', ({ itineraryId, dayId, eventData }) => {
      if (!itineraryUpdates[itineraryId]) {
        itineraryUpdates[itineraryId] = { reordered: null }
      }

      itineraryUpdates[itineraryId].reordered = { events: eventData.reorderedEvents }
      io.to(itineraryId).emit(`itinerary-update-${itineraryId}`, { action: 'reorder-events', dayId, events: eventData.reorderedEvents })
    })

    socket.on('disconnect', () => {
      console.log('Un cliente se ha desconectado')
    })
  })

  setInterval(async () => {
    for (const itineraryId in itineraryUpdates) {
      const { reordered } = itineraryUpdates[itineraryId]

      try {
        if (reordered) {
          await eventController.reorderEvents({ itineraryId, dayId: reordered.dayId, events: reordered.events })
        }

        console.log(`Reordenaciones guardadas en la base de datos para el itinerario ${itineraryId}`)
        delete itineraryUpdates[itineraryId]
      } catch (error) {
        console.error(`${error.name}: ${error.message}`)
        io.to(itineraryId).emit('event-error', { message: error.message })
      }
    }
  }, UPDATE_INTERVAL)

  return io
}
