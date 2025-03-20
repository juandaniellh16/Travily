import { itineraryService } from '@/services/itineraryService'
import {
  Accordion,
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Center,
  Container,
  FileButton,
  Group,
  Loader,
  Menu,
  Modal,
  ScrollArea,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ItineraryType, Event, UserPublic } from '@/types'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import { FaGripVertical, FaUsers } from 'react-icons/fa6'
import {
  MdEdit,
  MdOutlineVisibility,
  MdOutlineVisibilityOff
} from 'react-icons/md'
import { IoTrashOutline } from 'react-icons/io5'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { API_BASE_URL } from '@/config/config'
import { io, Socket } from 'socket.io-client'
import { useDisclosure } from '@mantine/hooks'
import { calculateTotalDays, getRandomEventImage } from '@/utils'
import { useAuth } from '@/hooks/useAuth'
import { LuCalendarDays } from 'react-icons/lu'
import { LikeButton } from '@/components/LikeButton'
import { userService } from '@/services/userService'
import { DatePickerInput } from '@mantine/dates'
import { ExpandableText } from '@/components/ExpandableText'
import { NotFound } from './NotFound'
import { Unauthorized } from './Unauthorized'
import { ShareButton } from '@/components/ShareButton'

export const Itinerary = () => {
  const navigate = useNavigate()
  const { user, isLoading: userIsLoading } = useAuth()
  const [isCollaborator, setIsCollaborator] = useState(false)
  const { itineraryId } = useParams()
  const [itineraryData, setItineraryData] = useState<ItineraryType | null>(null)
  const [userData, setUserData] = useState<UserPublic | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const [notFoundError, setNotFoundError] = useState(false)
  const [unauthorizedError, setUnauthorizedError] = useState(false)
  const [error, setError] = useState('')

  const [isEditingItinerary, setIsEditingItinerary] = useState(false)
  const [itineraryTitle, setItineraryTitle] = useState('')
  const [isEditingItineraryTitle, setIsEditingItineraryTitle] = useState(false)
  const [itineraryDescription, setItineraryDescription] = useState('')
  const [isEditingItineraryDescription, setIsEditingItineraryDescription] =
    useState(false)
  const [itineraryStartDate, setItineraryStartDate] = useState('')
  const [itineraryEndDate, setItineraryEndDate] = useState('')
  const [totalDays, setTotalDays] = useState(0)
  const [isPublic, setIsPublic] = useState(false)

  const [addEventOpened, addEventDisclosure] = useDisclosure(false)
  const [editEventOpened, editEventDisclosure] = useDisclosure(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [eventLabel, setEventLabel] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventImage, setEventImage] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  const [collaboratorUsername, setCollaboratorUsername] = useState('')
  const [collaboratorError, setCollaboratorError] = useState('')

  const handleItineraryTitleBlur = () => {
    if (itineraryId && itineraryTitle !== itineraryData?.title) {
      handleEditItinerary(itineraryId, {
        title: itineraryTitle.replace(/\s+/g, ' ').trim()
      })
    }
    setIsEditingItineraryTitle(false)
  }

  const handleItineraryTitleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setItineraryTitle(e.target.value)
  }

  const handleItineraryDescriptionBlur = () => {
    if (itineraryId && itineraryDescription !== itineraryData?.description) {
      handleEditItinerary(itineraryId, {
        description: itineraryDescription.replace(/\s+/g, ' ').trim()
      })
    }
    setIsEditingItineraryDescription(false)
  }

  const handleItineraryDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setItineraryDescription(e.target.value)
  }

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
      localDate.setUTCHours(0, 0, 0, 0)
      const newStartDate = localDate.toISOString()

      if (
        itineraryId &&
        itineraryData &&
        newStartDate !== itineraryData.startDate
      ) {
        if (newStartDate <= itineraryData.endDate) {
          setItineraryStartDate(newStartDate)
          handleEditItinerary(itineraryId, {
            startDate: newStartDate
          })
          setTotalDays(calculateTotalDays(newStartDate, itineraryData.endDate))
          if (error) setError('')
        } else {
          setError(
            'La fecha de inicio no puede ser posterior a la fecha de fin.'
          )
        }
      }
    } else {
      setItineraryStartDate('')
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      )
      localDate.setUTCHours(0, 0, 0, 0)
      const newEndDate = localDate.toISOString()

      if (
        itineraryId &&
        itineraryData &&
        newEndDate !== itineraryData.endDate
      ) {
        if (newEndDate >= itineraryData.startDate) {
          setItineraryEndDate(newEndDate)
          handleEditItinerary(itineraryId, {
            endDate: newEndDate
          })
          setTotalDays(calculateTotalDays(itineraryData.startDate, newEndDate))
          if (error) setError('')
        } else {
          setError(
            'La fecha de fin no puede ser anterior a la fecha de inicio.'
          )
        }
      }
    } else {
      setItineraryEndDate('')
    }
  }

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter') {
      if (isEditingItineraryTitle) {
        handleItineraryTitleBlur()
      } else if (isEditingItineraryDescription) {
        handleItineraryDescriptionBlur()
      }
    }
  }

  const handleItineraryImageChange = async (file: File | null) => {
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_BASE_URL}/upload/itinerary-image`, {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        if (data.itineraryImageUrl) {
          if (itineraryId && data.itineraryImageUrl !== itineraryData?.image) {
            handleEditItinerary(itineraryId, { image: data.itineraryImageUrl })
          }
        }
      } catch {
        setFormError('Failed to upload itinerary image')
      }
    }
  }

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

  const openAddEventModal = (dayId: string) => {
    setEditingDayId(dayId)
    addEventDisclosure.open()
  }

  const closeAddEventModal = () => {
    resetForm()
    addEventDisclosure.close()
  }

  const openEditEventModal = (event: Event, dayId: string) => {
    setEditingEvent(event)
    setEditingDayId(dayId)
    setEventLabel(event.label || '')
    setEventDescription(event.description || '')
    setEventImage(event.image || null)
    editEventDisclosure.open()
  }

  const closeEditEventModal = () => {
    resetForm()
    editEventDisclosure.close()
  }

  const scrollComponent = useMemo(
    () => ScrollArea.Autosize.withProps({ scrollbars: false }),
    []
  )

  const handleEventImageChange = async (
    file: File | null,
    event?: Event | null,
    dayId?: string | null
  ) => {
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
          if (!editEventOpened && event && dayId) {
            const updatedData = {
              image: data.eventImageUrl
            }
            handleEditEvent(event.id, updatedData, dayId)
          } else {
            setEventImage(data.eventImageUrl)
          }
        }
      } catch {
        setFormError('Failed to upload event image')
      }
    } else {
      setEventImage(null)
    }
  }

  const handleSubmitAddEvent = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (editingDayId) {
      const eventData = {
        orderIndex:
          itineraryData?.days.find((d) => d.id === editingDayId)?.events
            .length || 0,
        label: eventLabel,
        description: eventDescription,
        image: eventImage
      }
      handleAddEvent(editingDayId, eventData)
      resetForm()
      addEventDisclosure.close()
    }
  }

  const handleSubmitEditEvent = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (editingEvent && editingDayId) {
      const updatedData = {
        ...editingEvent,
        label: eventLabel,
        description: eventDescription,
        image: eventImage
      }
      handleEditEvent(editingEvent.id, updatedData, editingDayId)
      setEditingEvent(null)
      resetForm()
      editEventDisclosure.close()
    }
  }

  const resetForm = () => {
    setEditingEvent(null)
    setEditingDayId(null)
    setEventLabel('')
    setEventDescription('')
    setEventImage(null)
    setFormError('')
  }

  useEffect(() => {
    const fetchData = async () => {
      if (userIsLoading) return

      try {
        if (itineraryId) {
          let localIsCollaborator = false
          if (user) {
            try {
              localIsCollaborator = await itineraryService.checkIfCollaborator(
                itineraryId
              )
            } catch {
              localIsCollaborator = false
            }
            setIsCollaborator(localIsCollaborator)
          }

          if (!localIsCollaborator) {
            const localItineraryData = await itineraryService.getById(
              itineraryId
            )
            setItineraryData(localItineraryData)

            if (localItineraryData.userId) {
              const localUserData = await userService.getById(
                localItineraryData.userId
              )
              setUserData(localUserData)
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          switch (error.message) {
            case 'NotFoundError':
              setNotFoundError(true)
              break
            case 'UnauthorizedError':
              setUnauthorizedError(true)
              break
            default:
              setError(
                'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
              )
          }
        } else {
          setError(
            'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
          )
        }
      }
    }

    fetchData()
  }, [itineraryId, user, userIsLoading])

  useEffect(() => {
    // Si es colaborador, establecer conexión al WebSocket
    if (isCollaborator && itineraryId) {
      socketRef.current = io(API_BASE_URL)

      // Unirse a la sala del itinerario y esperar confirmación antes de cargar datos
      socketRef.current.emit('join-itinerary', itineraryId)

      const handleItineraryReady = async () => {
        try {
          const localItineraryData = await itineraryService.getById(itineraryId)
          setItineraryData(localItineraryData)
          if (localItineraryData.userId) {
            const userData = await userService.getById(
              localItineraryData.userId
            )
            setUserData(userData)
          }
          setItineraryStartDate(localItineraryData.startDate)
          setItineraryEndDate(localItineraryData.endDate)
          setIsPublic(localItineraryData.isPublic)
          setTotalDays(
            calculateTotalDays(
              localItineraryData.startDate,
              localItineraryData.endDate
            )
          )
        } catch {
          setError(
            'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
          )
        }
      }

      socketRef.current.on('itinerary-ready', handleItineraryReady)

      // Suscribirse a eventos de actualización
      socketRef.current.on(`itinerary-update-${itineraryId}`, (updatedData) => {
        if (updatedData.action === 'edit-itinerary') {
          setItineraryData((prevData) => {
            if (!prevData) return prevData

            const { startDate } = updatedData.updatedItineraryData

            if (startDate) {
              const updatedDays = prevData.days.map((day, index) => {
                const newDate = new Date(startDate)
                newDate.setDate(newDate.getDate() + index)

                let formattedDate = newDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })
                formattedDate =
                  formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

                return {
                  ...day,
                  label: `Día ${index + 1} - ${formattedDate}`
                }
              })

              updatedData.updatedItineraryData.days = updatedDays
            }

            return {
              ...prevData,
              ...updatedData.updatedItineraryData
            }
          })
        } else if (updatedData.action === 'add-day') {
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

  const handleVisibilityChange = async () => {
    try {
      if (itineraryId) {
        const newVisibility = !isPublic
        setIsPublic(newVisibility)
        await itineraryService.update(itineraryId, { isPublic: newVisibility })
      }
    } catch {
      setError('Error changing itinerary visibility')
    }
  }

  const handleEditItinerary = async (
    itineraryId: string,
    updatedItineraryData: Partial<ItineraryType>
  ) => {
    if (!itineraryData || !socketRef.current) return

    try {
      await itineraryService.update(itineraryId, updatedItineraryData)

      socketRef.current.emit('edit-itinerary', {
        itineraryId,
        updatedItineraryData
      })
    } catch {
      console.error('Error updating itinerary')
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

  const handleAddEvent = async (dayId: string, eventData: Partial<Event>) => {
    if (!itineraryData || !socketRef.current) return

    try {
      socketRef.current.emit('add-event', {
        itineraryId,
        dayId,
        eventData
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

  if (notFoundError) {
    return <NotFound from='itinerary' />
  }
  if (unauthorizedError) {
    return <Unauthorized />
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
        {isEditingItinerary ? (
          <FileButton
            onChange={(file) => {
              handleItineraryImageChange(file)
            }}
            accept='.png, .jpg, .jpeg'
          >
            {(props) => (
              <img
                src={itineraryData.image || '/images/landscape-placeholder.svg'}
                alt={itineraryData.title}
                className='w-full h-[250px] object-cover rounded-t-xl transition cursor-pointer hover:opacity-80'
                {...props}
              />
            )}
          </FileButton>
        ) : (
          <img
            src={itineraryData.image || '/images/landscape-placeholder.svg'}
            alt={itineraryData.title}
            className='w-full h-[250px] object-cover rounded-t-xl'
          />
        )}

        <div className='absolute bottom-[-20%] p-4 flex flex-col bg-white rounded-lg shadow-md w-[80%]'>
          <div className='flex items-center justify-between w-full mb-4'>
            <div className='items-center gap-3.5 sm:flex'>
              {isEditingItineraryTitle ? (
                <TextInput
                  value={itineraryTitle}
                  onChange={handleItineraryTitleChange}
                  onBlur={handleItineraryTitleBlur}
                  onKeyDown={handleKeyPress}
                  maxLength={50}
                  className='!flex-grow sm:!mb-0.5'
                  classNames={{
                    input:
                      '!text-xl sm:!text-2xl !font-bold !bg-neutral-100 !p-0 !border-0 !rounded-md !min-h-11'
                  }}
                  autoFocus
                />
              ) : (
                <h2
                  className={`text-xl sm:text-2xl min-h-11 !place-content-center !leading-none font-bold sm:!mb-0.5 ${
                    isEditingItinerary ? 'rounded-md hover:bg-neutral-100' : ''
                  }`}
                  onClick={() => {
                    if (isEditingItinerary) {
                      setItineraryTitle(itineraryData.title)
                      setIsEditingItineraryTitle(true)
                    }
                  }}
                >
                  {itineraryTitle || itineraryData.title || 'Sin título'}
                </h2>
              )}

              <div className='flex flex-shrink-0 gap-1 mt-1 sm:mt-0'>
                <Badge variant='light' color='orange' size='md'>
                  {itineraryData.locations[0]}
                </Badge>
                <Badge variant='light' color='pink' size='md'>
                  {calculateTotalDays(
                    itineraryData.startDate,
                    itineraryData.endDate
                  )}{' '}
                  días
                </Badge>
              </div>
            </div>

            {isCollaborator && (
              <Menu position='bottom-end' withArrow shadow='md' width={210}>
                <Menu.Target>
                  <ActionIcon
                    variant='filled'
                    radius='xl'
                    size={26}
                    aria-label='Opciones'
                    color='teal'
                    className='self-start mt-2 ml-4 sm:self-center sm:mt-0'
                  >
                    <HiOutlineDotsVertical size={20} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<MdEdit size={14} />}
                    onClick={() => setIsEditingItinerary(true)}
                  >
                    Editar itinerario
                  </Menu.Item>

                  {itineraryData.userId === user?.id && (
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
                          classNames={{
                            error: 'text-center'
                          }}
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

                      <Switch
                        size='sm'
                        color='teal'
                        onLabel={<MdOutlineVisibility size={18} />}
                        offLabel={<MdOutlineVisibilityOff size={18} />}
                        label={isPublic ? 'Público' : 'Privado'}
                        checked={isPublic}
                        onChange={handleVisibilityChange}
                        className='flex justify-center mb-2.5 text-gray-500'
                      />
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>
            )}
          </div>
          <div className='flex items-center gap-2 mb-3 text-[15px] text-gray-500'>
            <LuCalendarDays size={18} strokeWidth={1.5} />
            <div className='flex items-center gap-1'>
              {isEditingItinerary ? (
                <>
                  <DatePickerInput
                    valueFormat='DD-MM-YYYY'
                    value={
                      itineraryStartDate ? new Date(itineraryStartDate) : null
                    }
                    onChange={handleStartDateChange}
                    classNames={{
                      input:
                        '!p-0 !border-0 hover:!bg-neutral-100 !text-gray-500 !text-[15px] !min-h-6'
                    }}
                    autoFocus
                  />
                  <span>-</span>
                  <DatePickerInput
                    valueFormat='DD-MM-YYYY'
                    value={itineraryEndDate ? new Date(itineraryEndDate) : null}
                    onChange={handleEndDateChange}
                    classNames={{
                      input:
                        '!p-0 !border-0 hover:!bg-neutral-100 !text-gray-500 !text-[15px] !min-h-6'
                    }}
                  />
                </>
              ) : (
                <p className='!text-[15px]'>
                  {new Date(itineraryData.startDate).toLocaleDateString(
                    'es-ES',
                    {
                      day: '2-digit',
                      month: '2-digit'
                    }
                  )}
                  {' - '}
                  {new Date(itineraryData.endDate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit'
                  })}{' '}
                  {new Date(
                    itineraryEndDate || itineraryData.endDate
                  ).getFullYear()}
                </p>
              )}
            </div>
          </div>
          {isEditingItineraryDescription ? (
            <Textarea
              ref={(el) => {
                if (el) {
                  const length = itineraryDescription.length
                  el.setSelectionRange(length, length)
                }
              }}
              value={itineraryDescription}
              onChange={handleItineraryDescriptionChange}
              onBlur={handleItineraryDescriptionBlur}
              onKeyDown={handleKeyPress}
              maxLength={250}
              minRows={1}
              maxRows={6}
              autosize
              className='!flex-grow'
              classNames={{
                input:
                  '!text-[15px] sm:!text-[16px] !text-gray-800 !bg-neutral-100 !p-0 !border-0 !rounded-md !min-h-7 !leading-normal !align-top'
              }}
              autoFocus
            />
          ) : (
            <p
              className={`!text-[15px] sm:!text-[16px] min-h-7 !leading-normal break-words text-gray-800 ${
                isEditingItinerary ? 'rounded-md hover:bg-neutral-100' : ''
              }`}
              onClick={() => {
                if (isEditingItinerary) {
                  setItineraryDescription(itineraryData.description)
                  setIsEditingItineraryDescription(true)
                }
              }}
            >
              {itineraryDescription ||
                itineraryData.description ||
                'Sin descripción'}
            </p>
          )}
          <div className='flex items-center justify-between w-full mt-6'>
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
              <ShareButton />
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
                          {...(isEditingItinerary
                            ? provided.droppableProps
                            : {})}
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
                                  {...(isEditingItinerary
                                    ? provided.draggableProps
                                    : {})}
                                  className={`flex items-center mb-2 rounded-md group ${
                                    isEditingItinerary ? 'cursor-grab' : ''
                                  }`}
                                >
                                  <span
                                    {...provided.dragHandleProps}
                                    className={`hidden mr-2 cursor-grab ${
                                      isEditingItinerary ? 'sm:block' : ''
                                    }`}
                                  >
                                    <FaGripVertical size={20} color='gray' />
                                  </span>

                                  <div className='flex items-center justify-between w-full'>
                                    <Group
                                      {...(isEditingItinerary
                                        ? provided.dragHandleProps
                                        : {})}
                                      wrap='nowrap'
                                      gap='sm'
                                      className='flex items-center w-full'
                                    >
                                      {isEditingItinerary ? (
                                        <FileButton
                                          onChange={(file) => {
                                            handleEventImageChange(
                                              file,
                                              event,
                                              day.id
                                            )
                                          }}
                                          accept='.png, .jpg, .jpeg'
                                        >
                                          {(props) => (
                                            <Avatar
                                              src={
                                                event.image ||
                                                '/images/landscape-placeholder.svg'
                                              }
                                              radius='md'
                                              className={`flex-none self-start !min-h-[80px] !w-[100px] transition cursor-pointer hover:opacity-80`}
                                              {...props}
                                            />
                                          )}
                                        </FileButton>
                                      ) : (
                                        <Avatar
                                          src={
                                            event.image ||
                                            '/images/landscape-placeholder.svg'
                                          }
                                          radius='md'
                                          className='flex-none self-start !min-h-[80px] !w-[100px]'
                                        />
                                      )}
                                      <Container
                                        p={8}
                                        className={`flex-grow min-h-[80px] rounded-lg bg-neutral-100`}
                                      >
                                        <div className='flex flex-col gap-y-1'>
                                          <ExpandableText
                                            text={event.label}
                                            lines={1}
                                            lh={1.2}
                                          />
                                          <ExpandableText
                                            text={event.description}
                                            c='dimmed'
                                            lines={2}
                                            fw={400}
                                            size='sm'
                                          />
                                        </div>
                                      </Container>
                                    </Group>
                                    {isEditingItinerary && (
                                      <div className='flex flex-col content-end justify-end gap-1 ml-2 cursor-default'>
                                        <ActionIcon
                                          variant='light'
                                          color='teal'
                                          size='lg'
                                          radius='xl'
                                          aria-label='Editar'
                                          onClick={() =>
                                            openEditEventModal(event, day.id)
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
                  {isEditingItinerary && (
                    <div className='grid w-full grid-cols-1 gap-2 mt-6 sm:grid-cols-3'>
                      <div className='hidden sm:block'></div>
                      <div className='flex justify-center'>
                        <Button
                          variant='outline'
                          color='teal'
                          onClick={() => openAddEventModal(day.id)}
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
        {isEditingItinerary && itineraryData.days.length < totalDays && (
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
        opened={addEventOpened}
        onClose={closeAddEventModal}
        size='md'
        radius='lg'
        centered
        scrollAreaComponent={scrollComponent}
      >
        <div className='flex flex-col h-[70vh]'>
          <Title order={2} ta='center' mb='lg' className='sticky top-0 z-10'>
            Crear nuevo evento
          </Title>
          <div className='overflow-y-auto max-h-[70vh]'>
            {formError && (
              <p className='mb-4 text-center text-red-500'>{formError}</p>
            )}
            <div className='px-8'>
              <form onSubmit={handleSubmitAddEvent} className='mb-4'>
                <TextInput
                  label='Título'
                  value={eventLabel}
                  onChange={(e) => setEventLabel(e.target.value)}
                  size='md'
                  required
                />
                <Textarea
                  label='Descripción'
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  size='md'
                  mt='sm'
                  required
                />
                <Text size='md' fw={500} mt='sm' className='!mb-1'>
                  Imagen
                </Text>
                <div className='grid grid-cols-3 gap-2'>
                  <button
                    key={'/images/monument.avif'}
                    type='button'
                    onClick={() => setEventImage('/images/monument.avif')}
                    className={`w-full h-20 rounded-md overflow-hidden border-2 ${
                      eventImage === '/images/monument.avif'
                        ? 'border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={'/images/monument.avif'}
                      alt='Imagen predefinida'
                      className='object-cover w-full h-full'
                    />
                  </button>
                  <button
                    key={'/images/food.jpg'}
                    type='button'
                    onClick={() => setEventImage('/images/food.jpg')}
                    className={`w-full h-20 rounded-md overflow-hidden border-2 ${
                      eventImage === '/images/food.jpg'
                        ? 'border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={'/images/food.jpg'}
                      alt='Imagen predefinida'
                      className='object-cover w-full h-full'
                    />
                  </button>
                </div>
                <Text size='sm' ta='center' mt='sm' className='!text-gray-500'>
                  Subir imagen
                </Text>
                <div className='flex justify-center mt-2'>
                  <FileButton
                    onChange={handleEventImageChange}
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

      <Modal
        opened={editEventOpened}
        onClose={closeEditEventModal}
        size='md'
        radius='lg'
        centered
        scrollAreaComponent={scrollComponent}
      >
        <div className='flex flex-col h-[70vh]'>
          <Title order={2} ta='center' mb='lg' className='sticky top-0 z-10'>
            Editar evento
          </Title>
          <div className='overflow-y-auto max-h-[70vh]'>
            {formError && (
              <p className='mb-4 text-center text-red-500'>{formError}</p>
            )}
            <div className='px-8'>
              <form onSubmit={handleSubmitEditEvent} className='mb-4'>
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
                <Text size='md' fw={500} mt='sm' className='!mb-1'>
                  Imagen
                </Text>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    key={'/images/monument.avif'}
                    type='button'
                    onClick={() => setEventImage('/images/monument.avif')}
                    className={`w-full h-24 rounded-md overflow-hidden border-2 ${
                      eventImage === '/images/monument.avif'
                        ? 'border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={'/images/monument.avif'}
                      alt='Imagen predefinida'
                      className='object-cover w-full h-full'
                    />
                  </button>
                  <button
                    key={'/images/food.jpg'}
                    type='button'
                    onClick={() => setEventImage('/images/food.jpg')}
                    className={`w-full h-24 rounded-md overflow-hidden border-2 ${
                      eventImage === '/images/food.jpg'
                        ? 'border-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={'/images/food.jpg'}
                      alt='Imagen predefinida'
                      className='object-cover w-full h-full'
                    />
                  </button>
                </div>
                <Text size='sm' ta='center' mt='sm' className='!text-gray-500'>
                  Subir imagen
                </Text>
                <div className='flex justify-center mt-2'>
                  <FileButton
                    onChange={handleEventImageChange}
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
