import { itineraryService } from '@/services/itineraryService'
import {
  Accordion,
  ActionIcon,
  Avatar,
  Button,
  Center,
  Container,
  FileButton,
  Group,
  Loader,
  Menu,
  Modal,
  ScrollArea,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ItineraryType, Event, Collaborator, UserPublic } from '@/types'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import { FaGripVertical, FaUsers } from 'react-icons/fa6'
import { MdEdit } from 'react-icons/md'
import { IoShareSocialSharp, IoTrashOutline } from 'react-icons/io5'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { API_BASE_URL } from '@/config/config'
import { io, Socket } from 'socket.io-client'
import { useDisclosure } from '@mantine/hooks'
import { getRandomEventImage } from '@/utils'
import { useAuth } from '@/hooks/useAuth'
import { LuCalendarDays } from 'react-icons/lu'
import { LikeButton } from '@/components/LikeButton'
import { userService } from '@/services/userService'

export const Itinerary = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isCollaborator, setIsCollaborator] = useState(false)
  const { itineraryId } = useParams()
  const [itineraryData, setItineraryData] = useState<ItineraryType | null>(null)
  const [editingItinerary, setEditingItinerary] = useState(false)
  const [userData, setUserData] = useState<UserPublic | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [error, setError] = useState('')

  const [opened, { open, close }] = useDisclosure(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [eventLabel, setEventLabel] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventContent, setEventContent] = useState('')
  const [eventImage, setEventImage] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  const [collaboratorUsername, setCollaboratorUsername] = useState('')
  const [collaboratorError, setCollaboratorError] = useState('')

  const handleAddCollaborator = async () => {
    if (!collaboratorUsername) {
      setCollaboratorError('Por favor, ingresa un nombre de usuario.')
      return
    }
    try {
      if (itineraryId) {
        await itineraryService.addCollaborator(
          itineraryId,
          collaboratorUsername
        )
      }
      setCollaboratorUsername('')
      setCollaboratorError('')
    } catch {
      setCollaboratorError(
        'Error al añadir colaborador. Por favor, inténtalo de nuevo.'
      )
    }
  }

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

  const scrollComponent = useMemo(
    () => ScrollArea.Autosize.withProps({ scrollbars: false }),
    []
  )

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
    const fetchItineraryData = async () => {
      try {
        if (itineraryId) {
          const collaborators: Collaborator[] =
            await itineraryService.getCollaborators(itineraryId)
          const isCollaborator = collaborators.some(
            (collaborator) => collaborator.id === user?.id
          )

          setIsCollaborator(isCollaborator)

          if (!isCollaborator) {
            const itineraryData = await itineraryService.getById(itineraryId)
            setItineraryData(itineraryData)
          }
        }
      } catch {
        setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
      }
    }

    const fetchUserData = async () => {
      try {
        if (itineraryData?.userId) {
          const data = await userService.getById(itineraryData.userId)
          setUserData(data)
        }
      } catch {
        setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
      }
    }

    fetchItineraryData()
    fetchUserData()
  }, [itineraryId, itineraryData?.userId, user])

  useEffect(() => {
    // Si es colaborador, establecer conexión al WebSocket
    if (isCollaborator && itineraryId) {
      socketRef.current = io(API_BASE_URL)

      // Unirse a la sala del itinerario y esperar confirmación antes de cargar datos
      socketRef.current.emit('join-itinerary', itineraryId)

      const handleItineraryReady = async () => {
        try {
          const itineraryData = await itineraryService.getById(itineraryId)
          setItineraryData(itineraryData)
        } catch {
          setError(
            'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
          )
        }
      }

      socketRef.current.on('itinerary-ready', handleItineraryReady)

      // Suscribirse a eventos de actualización
      socketRef.current.on(`itinerary-update-${itineraryId}`, (updatedData) => {
        if (updatedData.action === 'add-day') {
          setItineraryData((prevData) => {
            if (!prevData) return prevData
            return {
              ...prevData,
              days: [
                ...prevData.days,
                { ...updatedData.day, events: updatedData.day.events ?? [] }
              ]
            }
          })
        } else if (updatedData.action === 'delete-day') {
          setItineraryData((prevData) => {
            if (!prevData) return prevData

            return {
              ...prevData,
              days: updatedData.days
            }
          })
        } else if (updatedData.action === 'add-event') {
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

      const handleError = (error: { message: string }) => {
        setError(error.message)
      }
      socketRef.current.on('error', handleError)
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off('error')
        socketRef.current.off('itinerary-ready')
        socketRef.current.off(`itinerary-update-${itineraryId}`)
        socketRef.current.emit('leave-itinerary', itineraryId)
        socketRef.current.disconnect()
      }
    }
  }, [itineraryId, isCollaborator])

  const handleDeleteItinerary = async () => {
    try {
      if (itineraryId) {
        await itineraryService.delete(itineraryId)
        navigate('/')
      }
    } catch {
      setError('Error deleting itinerary')
    }
  }

  const handleAddDay = async () => {
    if (!itineraryData || !socketRef.current) return

    const startDate = new Date(itineraryData.startDate)
    const newDate = new Date(startDate)
    newDate.setDate(startDate.getDate() + itineraryData.days.length)

    let formattedDate = newDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })

    formattedDate =
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

    const newDay = {
      label: `Día ${itineraryData.days.length + 1} - ${formattedDate}`,
      dayNumber: itineraryData.days.length + 1
    }

    try {
      socketRef.current.emit('add-day', { itineraryId, dayData: { newDay } })
    } catch {
      console.error('Error adding day')
    }
  }

  const handleDeleteDay = async (dayId: string) => {
    if (!itineraryData || !socketRef.current) return

    try {
      socketRef.current.emit('delete-day', {
        itineraryId,
        dayId,
        startDate: itineraryData.startDate,
        days: itineraryData.days.filter((day) => day.id !== dayId)
      })
    } catch {
      console.error('Error deleting day')
    }
  }

  const handleAddEvent = async (dayId: string) => {
    if (!itineraryData || !socketRef.current) return

    const newEvent = {
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
      <div className='relative flex justify-center w-full mb-16'>
        <img
          src={itineraryData?.image || '/images/landscape-placeholder.svg'}
          alt={itineraryData?.title}
          className='w-full h-[250px] object-cover rounded-t-xl'
        />

        <div className='absolute bottom-[-20%] p-4 flex flex-col bg-white rounded-lg shadow-md w-[80%]'>
          <div className='flex items-center justify-between w-full mb-4'>
            <h2 className='text-2xl font-bold md:text-3xl'>
              {itineraryData?.title}
            </h2>
            {isCollaborator && (
              <Menu position='bottom-end' withArrow shadow='md'>
                <Menu.Target>
                  <ActionIcon
                    variant='filled'
                    radius='xl'
                    aria-label='Opciones'
                    color='teal'
                  >
                    <HiOutlineDotsVertical size={18} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<MdEdit size={14} />}
                    onClick={() => setEditingItinerary(true)}
                  >
                    Editar itinerario
                  </Menu.Item>

                  {itineraryData?.userId === user?.id && (
                    <>
                      <Menu.Item
                        color='red'
                        leftSection={<IoTrashOutline size={14} />}
                        onClick={() => handleDeleteItinerary()}
                      >
                        Borrar itinerario
                      </Menu.Item>

                      <Menu.Divider />

                      <div className='p-4'>
                        <TextInput
                          placeholder='Nombre de usuario'
                          value={collaboratorUsername}
                          onChange={(e) =>
                            setCollaboratorUsername(e.target.value)
                          }
                          size='xs'
                          leftSection={<span>@</span>}
                          error={collaboratorError}
                        />
                        <Button
                          color='teal'
                          size='xs'
                          onClick={handleAddCollaborator}
                          leftSection={<FaUsers size={17} />}
                          fullWidth
                          mt='sm'
                        >
                          Añadir colaborador
                        </Button>
                      </div>
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>
            )}
          </div>
          <div className='flex items-center gap-2 text-[15px] text-gray-500'>
            <LuCalendarDays size={18} strokeWidth={1.5} />
            <p>
              {new Date(itineraryData?.startDate).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit'
              })}
              {' - '}
              {new Date(itineraryData?.endDate).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit'
              })}{' '}
              {new Date(itineraryData?.endDate).getFullYear()}
            </p>
          </div>
          <p className='mt-3 mb-6 text-justify text-gray-800 text-md'>
            {itineraryData?.description}
          </p>
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center'>
              <Center>
                <Link to={`/${userData?.username}`}>
                  <Avatar
                    src={userData?.avatar || '/images/avatar-placeholder.svg'}
                    mr='xs'
                    size={32}
                  />
                </Link>
                <div className='leading-none'>
                  <Link to={`/${userData?.username}`}>
                    <p className='text-xs font-medium'>{userData?.name}</p>
                    <p className='text-xs text-gray-500'>
                      @{userData?.username}
                    </p>
                  </Link>
                </div>
              </Center>
            </div>
            <Group gap={0}>
              <LikeButton itinerary={itineraryData} />
              <ActionIcon variant='subtle' color='gray' size={24} p={3}>
                <IoShareSocialSharp size={16} color='black' />
              </ActionIcon>
            </Group>
          </div>
        </div>
      </div>

      {error && <p className='mb-2 text-center text-red-500'>{error}</p>}
      <div className='w-full mt-3 mb-8'>
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
                          {...(editingItinerary ? provided.droppableProps : {})}
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
                                  {...(editingItinerary
                                    ? provided.draggableProps
                                    : {})}
                                  className={`flex items-center mb-2 rounded-md group ${
                                    editingItinerary ?? 'cursor-grab'
                                  }`}
                                >
                                  <span
                                    {...provided.dragHandleProps}
                                    className={`hidden mr-2 cursor-grab ${
                                      editingItinerary ?? 'sm:block'
                                    }`}
                                  >
                                    <FaGripVertical size={20} color='gray' />
                                  </span>

                                  <div className='flex items-center justify-between w-full'>
                                    <Group
                                      {...(editingItinerary
                                        ? provided.dragHandleProps
                                        : {})}
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
                                    {editingItinerary && (
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
                                    )}
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
                  {editingItinerary && (
                    <div className='grid w-full grid-cols-1 gap-2 mt-6 sm:grid-cols-3'>
                      <div className='hidden sm:block'></div>
                      <div className='flex justify-center'>
                        <Button
                          variant='outline'
                          color='teal'
                          onClick={() => handleAddEvent(day.id)}
                        >
                          Añadir evento
                        </Button>
                      </div>
                      <div className='flex justify-center sm:justify-end'>
                        <Button
                          variant='outline'
                          color='red'
                          onClick={() => handleDeleteDay(day.id)}
                        >
                          Borrar día
                        </Button>
                      </div>
                    </div>
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
        </Accordion>
        {editingItinerary && (
          <div className='flex justify-center mt-4'>
            <Button
              variant='outline'
              onClick={() => handleAddDay()}
              color='teal'
            >
              Añadir día
            </Button>
          </div>
        )}
      </div>

      <Modal
        opened={opened}
        onClose={closeEditModal}
        size='md'
        radius='lg'
        centered
        scrollAreaComponent={scrollComponent}
      >
        <div className='flex flex-col h-[70vh]'>
          <Title order={2} ta='center' mb='xl' className='sticky top-0 z-10'>
            Editar evento
          </Title>
          <div className='overflow-y-auto max-h-[70vh]'>
            {formError && (
              <p className='mb-4 text-center text-red-500'>{formError}</p>
            )}
            <div className='px-8'>
              <form onSubmit={handleSubmitEdit} className='mb-4'>
                <TextInput
                  label='Título'
                  value={eventLabel}
                  onChange={(e) => setEventLabel(e.target.value)}
                  classNames={{
                    input: '!text-gray-500 focus:!text-black'
                  }}
                  size='md'
                />
                <Textarea
                  label='Descripción'
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  classNames={{
                    input: '!text-gray-500 focus:!text-black'
                  }}
                  size='md'
                  mt='sm'
                />
                <Textarea
                  label='Contenido'
                  value={eventContent}
                  onChange={(e) => setEventContent(e.target.value)}
                  classNames={{
                    input: '!text-gray-500 focus:!text-black'
                  }}
                  size='md'
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
          </div>
        </div>
      </Modal>
    </>
  )
}
