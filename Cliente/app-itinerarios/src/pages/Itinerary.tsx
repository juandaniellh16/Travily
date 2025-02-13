import { itineraryService } from '@/services/itineraryService'
import {
  Accordion,
  ActionIcon,
  Avatar,
  Button,
  Container,
  FileButton,
  Group,
  Loader,
  Modal,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ItineraryType, Event } from '@/types'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import { FaGripVertical } from 'react-icons/fa6'
import { MdEdit } from 'react-icons/md'
import { IoTrashOutline } from 'react-icons/io5'
import { API_BASE_URL } from '@/config/config'
import { io, Socket } from 'socket.io-client'
import { useDisclosure } from '@mantine/hooks'
import { getRandomEventImage } from '@/utils'

export const Itinerary = () => {
  const { itineraryId } = useParams()
  const [itineraryData, setItineraryData] = useState<ItineraryType | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const [opened, { open, close }] = useDisclosure(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [eventLabel, setEventLabel] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventContent, setEventContent] = useState('')
  const [eventImage, setEventImage] = useState<string | null>(null)
  const [formError, setFormError] = useState('')
  const [error, setError] = useState('')

  /*
  const handleUpdateEvent = async (eventData: Event) => {
    if (!itineraryId) return

    socket.emit('update-event', { itineraryId, eventData })
  }
  */

  const openEditModal = (event: Event, dayId: string) => {
    setEditingEvent(event)
    setEditingDayId(dayId)
    setEventLabel(event.label || '')
    setEventDescription(event.description || '')
    setEventContent(event.content || '')
    setEventImage(event.image || null)
    open()
  }

  const closeEditModal = () => {
    resetForm()
    close()
  }

  const handleImageChange = async (file: File | null) => {
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_BASE_URL}/upload/event-image`, {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        if (data.eventImageUrl) {
          setEventImage(data.eventImageUrl)
        }
      } catch {
        setFormError('Failed to upload event image')
      }
    } else {
      setEventImage(null)
    }
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (editingEvent && editingDayId) {
      const updatedData = {
        ...editingEvent,
        label: eventLabel,
        description: eventDescription,
        content: eventContent,
        image: eventImage
      }
      handleEditEvent(editingEvent.id, updatedData, editingDayId)
      setEditingEvent(null)
      resetForm()
      close()
    }
  }

  const resetForm = () => {
    setEditingEvent(null)
    setEditingDayId(null)
    setEventLabel('')
    setEventDescription('')
    setEventContent('')
    setEventImage(null)
    setFormError('')
  }

  useEffect(() => {
    socketRef.current = io(API_BASE_URL)

    // Unirse al socket y esperar confirmación antes de cargar datos
    socketRef.current.emit('join-itinerary', itineraryId)

    const handleItineraryReady = () => {
      const fetchItineraryData = async () => {
        try {
          if (itineraryId) {
            const data = await itineraryService.getById(itineraryId)
            setItineraryData(data)
          }
        } catch {
          setError(
            'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
          )
        }
      }

      fetchItineraryData()
    }

    socketRef.current.on('itinerary-ready', handleItineraryReady)

    socketRef.current.on(`itinerary-update-${itineraryId}`, (updatedData) => {
      if (updatedData.action === 'add-event') {
        setItineraryData((prevData) => {
          if (!prevData) return prevData

          const newDays = prevData.days.map((day) => {
            if (day.id === updatedData.dayId) {
              return {
                ...day,
                events: [...day.events, updatedData.event]
              }
            }
            return day
          })

          return { ...prevData, days: newDays }
        })
      } else if (updatedData.action === 'delete-event') {
        setItineraryData((prevData) => {
          if (!prevData) return prevData

          const newDays = prevData.days.map((day) => {
            if (day.id === updatedData.dayId) {
              return {
                ...day,
                events: day.events.filter(
                  (event) => event.id !== updatedData.eventId
                )
              }
            }
            return day
          })

          return { ...prevData, days: newDays }
        })
      }
      if (updatedData.action === 'edit-event') {
        setItineraryData((prevData) => {
          if (!prevData) return prevData

          const newDays = prevData.days.map((day) => {
            if (day.id === updatedData.dayId) {
              return {
                ...day,
                events: day.events.map((event) =>
                  event.id === updatedData.eventId
                    ? { ...event, ...updatedData.updatedEventData }
                    : event
                )
              }
            }
            return day
          })

          return { ...prevData, days: newDays }
        })
      } else if (updatedData.action === 'reorder-events') {
        setItineraryData((prevData) => {
          if (!prevData) return prevData

          const newDays = prevData.days.map((day) => {
            if (day.id === updatedData.dayId) {
              return {
                ...day,
                events: updatedData.events
              }
            }
            return day
          })

          return { ...prevData, days: newDays }
        })
      }
    })

    const handleEventError = (error: { message: string }) => {
      setError(error.message)
    }

    socketRef.current.on('event-error', handleEventError)

    return () => {
      if (socketRef.current) {
        socketRef.current.off('event-error')
        socketRef.current.off('itinerary-ready')
        socketRef.current.off(`itinerary-update-${itineraryId}`)
        socketRef.current.emit('leave-itinerary', itineraryId)
        socketRef.current.disconnect()
      }
    }
  }, [itineraryId])

  const handleAddEvent = async (dayId: string) => {
    if (!itineraryData || !socketRef.current) return

    const newEvent = {
      id: '',
      orderIndex:
        itineraryData?.days.find((d) => d.id === dayId)?.events.length || 0,
      label: 'Nuevo Evento',
      description: 'Descripción del evento',
      image: null,
      content: 'Contenido del evento'
    }

    try {
      socketRef.current.emit('add-event', {
        itineraryId,
        dayId,
        eventData: { newEvent }
      })
    } catch {
      console.error('Error adding event')
    }
  }

  const handleDeleteEvent = async (eventId: string, dayId: string) => {
    if (!itineraryData || !socketRef.current) return

    try {
      socketRef.current.emit('delete-event', { itineraryId, dayId, eventId })

      setItineraryData((prevData) => {
        if (!prevData) return prevData

        const newDays = prevData.days.map((day) => {
          if (day.id === dayId) {
            return {
              ...day,
              events: day.events.filter((event) => event.id !== eventId)
            }
          }
          return day
        })

        return { ...prevData, days: newDays }
      })
    } catch {
      console.error('Error deleting event')
    }
  }

  const handleEditEvent = async (
    eventId: string,
    updatedEventData: Partial<Event>,
    dayId: string
  ) => {
    if (!itineraryData || !socketRef.current) return

    try {
      socketRef.current.emit('edit-event', {
        itineraryId,
        dayId,
        eventId,
        updatedEventData
      })

      setItineraryData((prevData) => {
        if (!prevData) return prevData

        const newDays = prevData.days.map((day) => {
          if (day.id === dayId) {
            return {
              ...day,
              events: day.events.map((event) =>
                event.id === eventId ? { ...event, ...updatedEventData } : event
              )
            }
          }
          return day
        })

        return { ...prevData, days: newDays }
      })
    } catch {
      console.error('Error updating event')
    }
  }

  // Función para manejar el cambio de orden de los eventos
  const handleDragEnd = async (result: DropResult, dayId: string) => {
    if (!itineraryData || !socketRef.current) return

    const { source, destination } = result
    if (!destination || source.index === destination.index) return

    let reorderedEvents: Event[] = []

    setItineraryData((prevData) => {
      if (!prevData) return prevData

      const newDays = [...prevData.days]
      const day = newDays.find((d) => d.id === dayId)

      if (!day) return prevData

      const [draggedEvent] = day.events.splice(source.index, 1)
      day.events.splice(destination.index, 0, draggedEvent)

      reorderedEvents = day.events.map((event, index) => ({
        ...event,
        orderIndex: index
      }))

      return { ...prevData, days: newDays }
    })

    try {
      socketRef.current.emit('reorder-events', {
        itineraryId,
        dayId,
        eventData: { reorderedEvents }
      })
    } catch {
      console.error('Error updating event order')
    }
  }

  if (!itineraryData) {
    return (
      <div className='flex items-center justify-center w-full h-full my-[25%]'>
        <Loader color='teal' />
      </div>
    )
  }

  return (
    <>
      <h2 className='mb-6 text-3xl font-bold text-center md:text-4xl'>
        {itineraryData?.title}
      </h2>
      {error && <p className='mb-4 text-center text-red-500'>{error}</p>}
      <p className='px-4 mb-3 text-justify text-gray-800 text-md'>
        {itineraryData?.description}
      </p>
      <div className='w-full my-4'>
        <Accordion
          multiple
          defaultValue={
            itineraryData?.days[0]?.label ? [itineraryData?.days[0]?.label] : []
          }
        >
          {itineraryData &&
            itineraryData.days.map((day) => (
              <Accordion.Item value={day.label} key={day.label}>
                <Accordion.Control>
                  <Text size='lg' fw={500}>
                    {day.label}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <DragDropContext
                    onDragEnd={(result) => handleDragEnd(result, day.id)}
                  >
                    <Droppable
                      droppableId={day.id.toString()}
                      direction='vertical'
                    >
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {day.events.map((event, index) => (
                            <Draggable
                              key={event.id.toString()}
                              draggableId={event.id.toString()}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className='flex items-center mb-2 rounded-md group cursor-grab'
                                >
                                  <span
                                    {...provided.dragHandleProps}
                                    className='hidden mr-2 sm:block cursor-grab'
                                  >
                                    <FaGripVertical size={20} color='gray' />
                                  </span>

                                  <div className='flex items-center justify-between w-full'>
                                    <Group
                                      {...provided.dragHandleProps}
                                      wrap='nowrap'
                                      gap='sm'
                                      className='flex items-center w-full'
                                    >
                                      <Avatar
                                        src={
                                          event.image ||
                                          getRandomEventImage(event.id)
                                        }
                                        radius='md'
                                        w={{ base: 100, sm: 130 }}
                                        h={{ base: 85, sm: 90 }}
                                        className='flex-none object-contain'
                                      />
                                      <Container
                                        p={8}
                                        h={{ base: 85, sm: 90 }}
                                        className='flex-grow rounded-lg bg-neutral-100'
                                      >
                                        <div className='flex flex-col gap-y-1'>
                                          <Text fw={500} lh={1.2}>
                                            {event.label}
                                          </Text>
                                          <Text
                                            size='sm'
                                            c='dimmed'
                                            fw={400}
                                            lineClamp={2}
                                          >
                                            {event.content}
                                          </Text>
                                        </div>
                                      </Container>
                                    </Group>
                                    <div className='flex flex-col content-end justify-end gap-1 ml-2 cursor-default'>
                                      <ActionIcon
                                        variant='light'
                                        color='teal'
                                        size='lg'
                                        radius='xl'
                                        aria-label='Editar'
                                        onClick={() =>
                                          openEditModal(event, day.id)
                                        }
                                      >
                                        <MdEdit />
                                      </ActionIcon>
                                      <ActionIcon
                                        variant='light'
                                        color='red'
                                        size='lg'
                                        radius='xl'
                                        aria-label='Eliminar'
                                        onClick={() =>
                                          handleDeleteEvent(event.id, day.id)
                                        }
                                      >
                                        <IoTrashOutline />
                                      </ActionIcon>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <div className='flex justify-center mt-3'>
                    <Button
                      variant='outline'
                      onClick={() => handleAddEvent(day.id)}
                      color='teal'
                    >
                      Añadir Evento
                    </Button>
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
        </Accordion>
      </div>

      <Modal
        opened={opened}
        onClose={closeEditModal}
        size='md'
        radius='lg'
        yOffset='10vh'
      >
        <Title order={2} ta='center' mb='xl'>
          Editar evento
        </Title>
        {formError && (
          <p className='mb-4 text-center text-red-500'>{formError}</p>
        )}
        <div className='px-8'>
          <form onSubmit={handleSubmitEdit} className='mb-4'>
            <TextInput
              label='Título'
              value={eventLabel}
              onChange={(e) => setEventLabel(e.target.value)}
            />
            <Textarea
              label='Descripción'
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              mt='sm'
            />
            <Textarea
              label='Contenido'
              value={eventContent}
              onChange={(e) => setEventContent(e.target.value)}
              mt='sm'
            />
            <div className='flex justify-center mt-4'>
              <FileButton
                onChange={handleImageChange}
                accept='.png, .jpg, .jpeg'
              >
                {(props) => (
                  <Avatar
                    src={eventImage || '/images/landscape-placeholder.svg'}
                    w={130}
                    h={90}
                    radius='md'
                    className='transition cursor-pointer hover:opacity-80'
                    {...props}
                  />
                )}
              </FileButton>
            </div>
            <Button type='submit' color='teal' fullWidth mt='lg'>
              Guardar
            </Button>
          </form>
        </div>
      </Modal>
    </>
  )
}
