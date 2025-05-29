import { itineraryService } from '@/services/itineraryService'
import {
  Accordion,
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Container,
  FileButton,
  Group,
  Loader,
  Menu,
  Modal,
  Popover,
  ScrollArea,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useLocation } from 'react-router'
import { ItineraryType, Event, UserPublic, ItineraryListType, EventCategory } from '@/types'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { FaGripVertical, FaUsers } from 'react-icons/fa6'
import { MdEdit, MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md'
import { IoClose, IoTrashOutline } from 'react-icons/io5'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { API_BASE_URL } from '@/config/config'
import { io, Socket } from 'socket.io-client'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import {
  calculateTotalDays,
  eventCategories,
  categoryTranslations,
  getCategoryIcon,
  getCategoryImage
} from '@/utils'
import { useAuth } from '@/hooks/useAuth'
import { LuCalendarDays } from 'react-icons/lu'
import { LikeButton } from '@/components/itineraries/LikeButton'
import { userService } from '@/services/userService'
import { DatePickerInput, TimeInput } from '@mantine/dates'
import { ExpandableText } from '@/components/common/ExpandableText'
import { NotFound } from './NotFound'
import { Unauthorized } from './Unauthorized'
import { ShareButton } from '@/components/ui/ShareButton'
import { GoClock } from 'react-icons/go'
import { FiPlus } from 'react-icons/fi'
import { itineraryListService } from '@/services/itineraryListService'

export const Itinerary = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery('(max-width: 480px)')
  const isTooSmallScreen = useMediaQuery('(max-width: 370px)')

  const { user, isLoading: userIsLoading } = useAuth()
  const [isCollaborator, setIsCollaborator] = useState(false)
  const { itineraryId } = useParams()
  const [itineraryData, setItineraryData] = useState<ItineraryType | null>(null)
  const [userData, setUserData] = useState<UserPublic | null>(null)
  const [collaborators, setCollaborators] = useState<UserPublic[]>([])
  const socketRef = useRef<Socket | null>(null)
  const [notFoundError, setNotFoundError] = useState(false)
  const [unauthorizedError, setUnauthorizedError] = useState(false)
  const [error, setError] = useState('')

  const [isEditingItinerary, setIsEditingItinerary] = useState(location.state?.created ?? false)
  const [itineraryTitle, setItineraryTitle] = useState('')
  const [isEditingItineraryTitle, setIsEditingItineraryTitle] = useState(false)
  const [itineraryDescription, setItineraryDescription] = useState('')
  const [isEditingItineraryDescription, setIsEditingItineraryDescription] = useState(false)
  const [itineraryStartDate, setItineraryStartDate] = useState('')
  const [itineraryEndDate, setItineraryEndDate] = useState('')
  const [totalDays, setTotalDays] = useState(0)
  const [isPublic, setIsPublic] = useState(false)

  const [addToListOpened, addToListDisclosure] = useDisclosure(false)
  const [userLists, setUserLists] = useState<ItineraryListType[] | null>(null)
  const [addEventOpened, addEventDisclosure] = useDisclosure(false)
  const [editEventOpened, editEventDisclosure] = useDisclosure(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [eventLabel, setEventLabel] = useState('')
  const [eventDescription, setEventDescription] = useState('')
  const [eventStartTime, setEventStartTime] = useState('')
  const [eventEndTime, setEventEndTime] = useState('')
  const [eventCategory, setEventCategory] = useState<EventCategory | null>(null)
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

  const handleItineraryTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleItineraryDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setItineraryDescription(e.target.value)
  }

  const handleStartDateChange = (date: Date | null) => {
    if (!date || !itineraryData || !itineraryId) {
      setItineraryStartDate('')
      return
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    localDate.setUTCHours(0, 0, 0, 0)
    const newStartDate = localDate.toISOString()

    if (newStartDate === itineraryData.startDate) return

    if (newStartDate > itineraryData.endDate) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin.')
      return
    }

    const oldTotalDays = itineraryData.days.length
    const newTotalDays = calculateTotalDays(newStartDate, itineraryData.endDate)

    if (newTotalDays < oldTotalDays) {
      setError(
        `Este itinerario tiene ${oldTotalDays} días. Elimina días del itinerario antes de retrasar la fecha de inicio.`
      )
      return
    }

    setItineraryStartDate(newStartDate)
    handleEditItinerary(itineraryId, {
      startDate: newStartDate
    })
    setTotalDays(newTotalDays)
    if (error) setError('')
  }

  const handleEndDateChange = (date: Date | null) => {
    if (!date || !itineraryData || !itineraryId) {
      setItineraryEndDate('')
      return
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    localDate.setUTCHours(0, 0, 0, 0)
    const newEndDate = localDate.toISOString()

    if (newEndDate === itineraryData.endDate) return

    if (newEndDate < itineraryData.startDate) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio.')
      return
    }

    const oldTotalDays = itineraryData.days.length
    const newTotalDays = calculateTotalDays(itineraryData.startDate, newEndDate)

    if (newTotalDays < oldTotalDays) {
      setError(
        `Este itinerario tiene ${oldTotalDays} días. Elimina días del itinerario antes de adelantar la fecha de fin.`
      )
      return
    }

    setItineraryEndDate(newEndDate)
    handleEditItinerary(itineraryId, {
      endDate: newEndDate
    })
    setTotalDays(newTotalDays)
    if (error) setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        const fileName = `${user?.username}-${Date.now()}`
        const customFile = new File([file], fileName, { type: file.type })
        formData.append('file', customFile)

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
        await itineraryService.addCollaborator(itineraryId, collaboratorUsername)
      }
      setCollaboratorUsername('')
      setCollaboratorError('')
    } catch {
      setCollaboratorError('Error al añadir colaborador. Por favor, inténtalo de nuevo.')
    }
  }

  const openAddToListModal = async () => {
    addToListDisclosure.open()
    const userListsLocal = await itineraryListService.getAll({
      userId: user?.id,
      visibility: 'all'
    })
    setUserLists(userListsLocal)
  }

  const closeAddToListModal = async () => {
    addToListDisclosure.close()
    setTimeout(() => {
      setUserLists(null)
    }, 500)
  }

  const handleAddToList = async (listId: string) => {
    if (!itineraryId || !listId) return
    try {
      await itineraryListService.addItineraryToList(listId, itineraryId)
      closeAddToListModal()
    } catch {
      console.error('Error adding itinerary to list')
    }
  }

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
    setEventStartTime(event.startTime ? event.startTime.slice(0, 5) : '')
    setEventEndTime(event.endTime ? event.endTime.slice(0, 5) : '')
    setEventCategory(event.category)
    setEventImage(event.image || null)
    editEventDisclosure.open()
  }

  const closeEditEventModal = () => {
    resetForm()
    editEventDisclosure.close()
  }

  const scrollComponent = useMemo(() => ScrollArea.Autosize.withProps({ scrollbars: false }), [])

  const handleEventImageChange = async (
    file: File | null,
    event?: Event | null,
    dayId?: string | null
  ) => {
    if (file) {
      try {
        const formData = new FormData()
        const fileName = `${user?.username}-${Date.now()}`
        const customFile = new File([file], fileName, { type: file.type })
        formData.append('file', customFile)

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
        orderIndex: itineraryData?.days.find((d) => d.id === editingDayId)?.events.length || 0,
        label: eventLabel,
        description: eventDescription,
        startTime: eventStartTime === '' ? null : eventStartTime,
        endTime: eventEndTime === '' ? null : eventEndTime,
        category: eventCategory,
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
        startTime: eventStartTime === '' ? null : eventStartTime,
        endTime: eventEndTime === '' ? null : eventEndTime,
        category: eventCategory,
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
    setEventStartTime('')
    setEventEndTime('')
    setEventCategory(null)
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
              localIsCollaborator = await itineraryService.checkIfCollaborator(itineraryId)
            } catch {
              localIsCollaborator = false
            }
            setIsCollaborator(localIsCollaborator)
          }

          if (!localIsCollaborator) {
            const localItineraryData = await itineraryService.getById(itineraryId)
            setItineraryData(localItineraryData)

            if (localItineraryData.userId) {
              const localUserData = await userService.getById(localItineraryData.userId)
              setUserData(localUserData)
            }
          }

          const localCollaborators = await itineraryService.getCollaborators(itineraryId)
          setCollaborators(localCollaborators)
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
              setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
          }
        } else {
          setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
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
            const userData = await userService.getById(localItineraryData.userId)
            setUserData(userData)
          }
          setItineraryStartDate(localItineraryData.startDate)
          setItineraryEndDate(localItineraryData.endDate)
          setIsPublic(localItineraryData.isPublic)
          setTotalDays(calculateTotalDays(localItineraryData.startDate, localItineraryData.endDate))
        } catch {
          setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
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
                formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

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
              days: [...prevData.days, { ...updatedData.day, events: updatedData.day.events ?? [] }]
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
                  events: day.events.filter((event) => event.id !== updatedData.eventId)
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

    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

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
        <Loader color='brand' />
      </div>
    )
  }

  return (
    <>
      <div className='relative flex justify-center w-full mb-16'>
        {isEditingItinerary && itineraryData.userId === user?.id ? (
          <FileButton
            onChange={(file) => {
              handleItineraryImageChange(file)
            }}
            accept='.png, .jpg, .jpeg'
          >
            {(props) => (
              <img
                src={itineraryData.image || '/images/placeholder/landscape-placeholder.svg'}
                alt={itineraryData.title}
                className='w-full h-[250px] object-cover rounded-t-xl transition cursor-pointer hover:opacity-80'
                {...props}
              />
            )}
          </FileButton>
        ) : (
          <img
            src={itineraryData.image || '/images/placeholder/landscape-placeholder.svg'}
            alt={itineraryData.title}
            className='w-full h-[250px] object-cover rounded-t-xl'
          />
        )}

        <div className='absolute bottom-[-20%] p-4 flex flex-col bg-white rounded-lg shadow-md w-[80%]'>
          <div className='flex items-center justify-between w-full mb-4'>
            <div className='items-center gap-3.5 sm:flex'>
              {isEditingItineraryTitle && itineraryData.userId === user?.id ? (
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
                    isEditingItinerary && itineraryData.userId === user?.id
                      ? 'rounded-md hover:bg-neutral-100'
                      : ''
                  }`}
                  onClick={() => {
                    if (isEditingItinerary && itineraryData.userId === user?.id) {
                      setItineraryTitle(itineraryData.title)
                      setIsEditingItineraryTitle(true)
                    }
                  }}
                >
                  {itineraryTitle || itineraryData.title || 'Sin título'}
                </h2>
              )}

              <div className='flex flex-shrink-0 gap-1 mt-1 sm:mt-0'>
                <Badge variant='light' color='orange' size='md' className='!normal-case'>
                  {itineraryData.location.countryName
                    ? itineraryData.location.name === itineraryData.location.countryName
                      ? itineraryData.location.name
                      : `${itineraryData.location.name}, ${itineraryData.location.countryName}`
                    : itineraryData.location.name}
                </Badge>
                <Badge variant='light' color='pink' size='md' className='!normal-case'>
                  {calculateTotalDays(itineraryData.startDate, itineraryData.endDate)} días
                </Badge>
              </div>
            </div>

            {user && (
              <Menu position='bottom-end' withArrow shadow='md' width={210}>
                <Menu.Target>
                  <ActionIcon
                    variant='filled'
                    radius='xl'
                    size={26}
                    aria-label='Opciones'
                    color='brand'
                    className='self-start mt-2 ml-4 sm:self-center sm:mt-0'
                  >
                    <HiOutlineDotsVertical size={20} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<FiPlus size={15} strokeWidth={3} />}
                    onClick={() => openAddToListModal()}
                  >
                    Añadir a lista
                  </Menu.Item>
                  {isCollaborator && (
                    <>
                      <Menu.Divider />
                      {isEditingItinerary ? (
                        <Menu.Item
                          leftSection={<MdEdit size={14} />}
                          onClick={() => setIsEditingItinerary(false)}
                        >
                          Dejar de editar
                        </Menu.Item>
                      ) : (
                        <Menu.Item
                          leftSection={<MdEdit size={14} />}
                          onClick={() => setIsEditingItinerary(true)}
                        >
                          Editar itinerario
                        </Menu.Item>
                      )}

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

                          <div className='px-4 pt-4'>
                            <TextInput
                              placeholder='Nombre de usuario'
                              value={collaboratorUsername}
                              onChange={(e) => setCollaboratorUsername(e.target.value)}
                              size='xs'
                              leftSection={<span>@</span>}
                              error={collaboratorError}
                              classNames={{
                                error: 'text-center'
                              }}
                            />
                            <Button
                              color='brand'
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
                            color='brand'
                            onLabel={<MdOutlineVisibility size={18} />}
                            offLabel={<MdOutlineVisibilityOff size={18} />}
                            label={isPublic ? 'Público' : 'Privado'}
                            checked={isPublic}
                            onChange={handleVisibilityChange}
                            className='flex justify-center mt-4 mb-2.5 text-gray-500'
                          />
                        </>
                      )}
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>
            )}
          </div>
          <div className='flex items-center gap-2 mb-3 text-[15px] text-gray-500'>
            <LuCalendarDays size={18} strokeWidth={1.5} />
            <div className='flex items-center gap-1'>
              {isEditingItinerary && itineraryData.userId === user?.id ? (
                <>
                  <DatePickerInput
                    valueFormat='DD-MM-YYYY'
                    value={itineraryStartDate ? new Date(itineraryStartDate) : null}
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
                  {new Date(itineraryData.startDate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                  })}
                  {' - '}
                  {new Date(itineraryData.endDate).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
          {isEditingItineraryDescription && itineraryData.userId === user?.id ? (
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
                isEditingItinerary && itineraryData.userId === user?.id
                  ? 'rounded-md hover:bg-neutral-100'
                  : ''
              }`}
              onClick={() => {
                if (isEditingItinerary && itineraryData.userId === user?.id) {
                  setItineraryDescription(itineraryData.description)
                  setIsEditingItineraryDescription(true)
                }
              }}
            >
              {isEditingItinerary &&
              itineraryData.userId === user?.id &&
              !(itineraryDescription || itineraryData.description)
                ? 'Añade una descripción...'
                : itineraryDescription || itineraryData.description}
            </p>
          )}
          <div className='flex items-center justify-between w-full mt-6'>
            <div className='flex items-center w-[70%] overflow-hidden'>
              <Link to={`/${userData?.username}`}>
                <Avatar
                  src={userData?.avatar || '/images/placeholder/avatar-placeholder.svg'}
                  mr='xs'
                  size={32}
                />
              </Link>
              <div className='overflow-hidden leading-none'>
                <Link to={`/${userData?.username}`}>
                  <Text truncate='end' className='!font-medium !text-xs'>
                    {userData?.name}
                  </Text>
                  <Text truncate='end' className='!text-gray-500 !text-xs'>
                    @{userData?.username}
                  </Text>
                </Link>
              </div>
              <Popover position='bottom'>
                <Popover.Target>
                  <div className={`cursor-pointer ${isTooSmallScreen ? 'hidden' : 'block'}`}>
                    <Avatar.Group className='ml-1.5 sm:ml-4' spacing={isMobile ? 'lg' : 'md'}>
                      {isMobile ? (
                        <>
                          {collaborators
                            .filter((c) => c.id !== user?.id)
                            .slice(0, 1)
                            .map((collaborator) => (
                              <Avatar
                                key={collaborator.id}
                                src={
                                  collaborator.avatar ||
                                  '/images/placeholder/avatar-placeholder.svg'
                                }
                                size={32}
                              />
                            ))}
                          {collaborators.length > 1 && (
                            <Avatar size={32}>+{collaborators.length - 1}</Avatar>
                          )}
                        </>
                      ) : collaborators.filter((c) => c.id !== user?.id).length < 3 ? (
                        <>
                          {collaborators
                            .filter((c) => c.id !== user?.id)
                            .map((collaborator) => (
                              <Avatar
                                key={collaborator.id}
                                src={
                                  collaborator.avatar ||
                                  '/images/placeholder/avatar-placeholder.svg'
                                }
                                size={32}
                              />
                            ))}
                          {collaborators.length > 1 && <Avatar size={32}>+1</Avatar>}
                        </>
                      ) : (
                        <>
                          {collaborators
                            .filter((c) => c.id !== user?.id)
                            .slice(0, 3)
                            .map((collaborator) => (
                              <Avatar
                                key={collaborator.id}
                                src={
                                  collaborator.avatar ||
                                  '/images/placeholder/avatar-placeholder.svg'
                                }
                                size={32}
                              />
                            ))}
                          <Avatar size={32}>+{collaborators.length - 3}</Avatar>
                        </>
                      )}
                    </Avatar.Group>
                  </div>
                </Popover.Target>

                <Popover.Dropdown className='p-2 overflow-hidden shadow-md w-60 rounded-xl'>
                  <div className='flex flex-col gap-3.5'>
                    {collaborators.map((collaborator) => (
                      <>
                        {collaborator.id === user?.id && (
                          <span className='text-[13px] font-semibold'>Propietario</span>
                        )}
                        <Link
                          to={`/${collaborator.username}`}
                          key={collaborator.id}
                          className={`flex items-center gap-2 ${collaborator.id === user?.id ? 'border-b pb-3' : ''}`}
                        >
                          <Avatar
                            src={
                              collaborator.avatar || '/images/placeholder/avatar-placeholder.svg'
                            }
                            size={32}
                          />
                          <div className='overflow-hidden leading-none max-w-[8rem]'>
                            <Text truncate='end' className='!font-medium !text-xs'>
                              {collaborator.name}
                            </Text>
                            <Text truncate='end' className='!text-gray-500 !text-xs'>
                              @{collaborator.username}
                            </Text>
                          </div>
                        </Link>
                      </>
                    ))}
                  </div>
                </Popover.Dropdown>
              </Popover>
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
          defaultValue={itineraryData?.days[0]?.label ? [itineraryData?.days[0]?.label] : []}
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
                  <DragDropContext onDragEnd={(result) => handleDragEnd(result, day.id)}>
                    <Droppable droppableId={day.id.toString()} direction='vertical'>
                      {(provided) => (
                        <div
                          {...(isEditingItinerary ? provided.droppableProps : {})}
                          ref={provided.innerRef}
                        >
                          {day.events.map((event, index) => {
                            const EventIcon = getCategoryIcon(event.category)

                            return (
                              <Draggable
                                key={event.id.toString()}
                                draggableId={event.id.toString()}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...(isEditingItinerary ? provided.draggableProps : {})}
                                    className={`flex items-center mb-2 rounded-md group ${
                                      isEditingItinerary ? 'cursor-grab' : ''
                                    }`}
                                  >
                                    <span
                                      {...provided.dragHandleProps}
                                      className={`hidden mr-2 cursor-grab self-start content-center h-[80px] sm:h-[100px] ${
                                        isEditingItinerary ? 'sm:block' : ''
                                      }`}
                                    >
                                      <FaGripVertical size={20} color='gray' />
                                    </span>

                                    <div className='flex items-center justify-between w-full'>
                                      <Group
                                        {...(isEditingItinerary ? provided.dragHandleProps : {})}
                                        wrap='nowrap'
                                        gap={6}
                                        className='flex items-center w-full'
                                      >
                                        <Container
                                          pl={32}
                                          py={8}
                                          pr={8}
                                          className={`flex-grow gap-y-1 justify-between flex flex-col min-h-[80px] sm:min-h-[100px] rounded-lg bg-neutral-100 relative`}
                                        >
                                          <div className='absolute top-0 left-0 translate-y-1 -translate-x-1 flex items-center justify-center py-1.5 px-1.5 rounded-sm bg-emerald-500'>
                                            <EventIcon size={15} color='white' />
                                          </div>

                                          <div className='gap-y-1'>
                                            <ExpandableText text={event.label} lines={1} lh={1.2} />
                                            <ExpandableText
                                              text={event.description}
                                              c='dimmed'
                                              lines={2}
                                              fw={400}
                                              size='sm'
                                            />
                                          </div>
                                          {event.startTime && (
                                            <div className='text-sm font-medium text-gray-500'>
                                              {event.startTime.slice(0, 5)}
                                              {event.endTime && ` - ${event.endTime.slice(0, 5)}`}
                                            </div>
                                          )}
                                        </Container>
                                        {isEditingItinerary ? (
                                          <FileButton
                                            onChange={(file) => {
                                              handleEventImageChange(file, event, day.id)
                                            }}
                                            accept='.png, .jpg, .jpeg'
                                          >
                                            {(props) => (
                                              <Avatar
                                                src={
                                                  event.image ||
                                                  getCategoryImage(event.category) ||
                                                  '/images/placeholder/landscape-placeholder.svg'
                                                }
                                                radius='md'
                                                className={`flex-none !h-[80px] !w-[100px] sm:!h-[100px] sm:!w-[140px] self-start transition cursor-pointer hover:opacity-80`}
                                                {...props}
                                              />
                                            )}
                                          </FileButton>
                                        ) : (
                                          <Avatar
                                            src={
                                              event.image ||
                                              getCategoryImage(event.category) ||
                                              '/images/placeholder/landscape-placeholder.svg'
                                            }
                                            radius='md'
                                            className='flex-none !h-[80px] !w-[100px] sm:!h-[100px] sm:!w-[140px] self-start'
                                          />
                                        )}
                                      </Group>
                                      {isEditingItinerary && (
                                        <div className='flex flex-col self-start justify-center h-[80px] sm:h-[100px] gap-1 ml-2 cursor-default'>
                                          <ActionIcon
                                            variant='light'
                                            color='brand'
                                            size='lg'
                                            radius='xl'
                                            aria-label='Editar'
                                            onClick={() => openEditEventModal(event, day.id)}
                                          >
                                            <MdEdit />
                                          </ActionIcon>
                                          <ActionIcon
                                            variant='light'
                                            color='red'
                                            size='lg'
                                            radius='xl'
                                            aria-label='Eliminar'
                                            onClick={() => handleDeleteEvent(event.id, day.id)}
                                          >
                                            <IoTrashOutline />
                                          </ActionIcon>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            )
                          })}
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
                          color='brand'
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
            <Button variant='outline' onClick={() => handleAddDay()} color='brand'>
              Añadir día
            </Button>
          </div>
        )}
      </div>

      <Modal
        opened={addToListOpened}
        onClose={closeAddToListModal}
        size='md'
        radius='lg'
        centered
        scrollAreaComponent={scrollComponent}
      >
        <div className='flex flex-col h-[70vh]'>
          <Title order={2} ta='center' mb='lg' className='sticky top-0 z-10'>
            Selecciona una lista
          </Title>
          {!userLists ? (
            <div className='flex px-8 items-center justify-center w-full my-[25%]'>
              <Loader color='brand' />
            </div>
          ) : userLists.length === 0 ? (
            <div className='px-8'>
              <p className='mt-6 text-center text-gray-500'>No tienes listas disponibles</p>
              <div className='flex items-center justify-center mt-10'>
                <Button
                  variant='outline'
                  color='brand'
                  size='sm'
                  radius='sm'
                  className='text-nowrap'
                  onClick={() => {
                    navigate('/create-list')
                  }}
                >
                  Crea tu primera lista
                </Button>
              </div>
            </div>
          ) : (
            <div className='overflow-y-auto max-h-[70vh]'>
              <div className='px-8'>
                {userLists.map((list) => (
                  <Button
                    key={list.id}
                    fullWidth
                    variant='light'
                    color='brand'
                    onClick={() => handleAddToList(list.id)}
                    className='mb-2'
                  >
                    {list.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

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
            {formError && <p className='mb-4 text-center text-red-500'>{formError}</p>}
            <div className='px-8'>
              <form onSubmit={handleSubmitAddEvent} className='mb-4'>
                <TextInput
                  label='Título'
                  value={eventLabel}
                  onChange={(e) => setEventLabel(e.target.value)}
                  size='md'
                  maxLength={50}
                  required
                />
                <Textarea
                  label='Descripción'
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  size='md'
                  mt='sm'
                  maxLength={250}
                />
                <div className='flex items-center flex-grow gap-2.5 mt-5'>
                  <TimeInput
                    label='Hora de inicio'
                    leftSection={<GoClock size={18} />}
                    value={eventStartTime}
                    onChange={(event) => setEventStartTime(event.currentTarget.value)}
                    size='md'
                    className='w-full'
                    rightSection={
                      eventStartTime ? (
                        <ActionIcon
                          size={20}
                          radius='xl'
                          variant='transparent'
                          onClick={() => setEventStartTime('')}
                          aria-label='Borrar hora de inicio'
                          tabIndex={-1}
                        >
                          <IoClose size={16} />
                        </ActionIcon>
                      ) : null
                    }
                    rightSectionWidth={30}
                  />

                  <TimeInput
                    label='Hora de fin'
                    leftSection={<GoClock size={18} />}
                    value={eventEndTime}
                    onChange={(event) => setEventEndTime(event.currentTarget.value)}
                    size='md'
                    className='w-full'
                    rightSection={
                      eventEndTime ? (
                        <ActionIcon
                          size={20}
                          radius='xl'
                          variant='transparent'
                          onClick={() => setEventEndTime('')}
                          aria-label='Borrar hora de fin'
                          tabIndex={-1}
                        >
                          <IoClose size={16} />
                        </ActionIcon>
                      ) : null
                    }
                    rightSectionWidth={30}
                  />
                </div>
                <Text size='md' fw={500} mt='sm' className='!mb-1'>
                  Categoría
                </Text>
                <div className='grid grid-cols-3 gap-2'>
                  {eventCategories.map((name) => {
                    const Icon = getCategoryIcon(name)
                    return (
                      <button
                        key={name}
                        type='button'
                        onClick={() => {
                          if (eventCategory === name) {
                            setEventCategory(null)
                          } else {
                            setEventCategory(name)
                          }
                        }}
                        className={`w-full h-20 flex flex-col items-center justify-center rounded-md border-2 bg-emerald-500 ${
                          eventCategory === name ? 'border-blue-500' : 'border-gray-300'
                        }`}
                      >
                        <Icon size={24} color='white' />
                        <span className='mt-1 text-[13px] capitalize text-white'>
                          {categoryTranslations[name]}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <Text size='md' fw={500} ta='center' mt='sm'>
                  Subir imagen
                </Text>
                <div className='relative mx-auto w-[130px] h-[90px] mt-2'>
                  <FileButton onChange={handleEventImageChange} accept='.png, .jpg, .jpeg'>
                    {(props) => (
                      <Avatar
                        src={
                          eventImage ||
                          (eventCategory && getCategoryImage(eventCategory)) ||
                          '/images/placeholder/landscape-placeholder.svg'
                        }
                        w={130}
                        h={90}
                        radius='md'
                        className='transition cursor-pointer hover:opacity-80'
                        {...props}
                      />
                    )}
                  </FileButton>
                  {eventImage && (
                    <button
                      type='button'
                      onClick={() => setEventImage(null)}
                      className='absolute top-[-8px] right-[-8px] bg-gray-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-gray-500'
                      aria-label='Remove image'
                    >
                      ✕
                    </button>
                  )}
                </div>
                <Button type='submit' color='brand' fullWidth mt='lg'>
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
            {formError && <p className='mb-4 text-center text-red-500'>{formError}</p>}
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
                  maxLength={50}
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
                  maxLength={250}
                />
                <div className='flex items-center flex-grow gap-2.5 mt-5'>
                  <TimeInput
                    label='Hora de inicio'
                    leftSection={<GoClock size={18} />}
                    value={eventStartTime}
                    onChange={(event) => setEventStartTime(event.currentTarget.value)}
                    size='md'
                    className='w-full'
                    rightSection={
                      eventStartTime ? (
                        <ActionIcon
                          size={20}
                          radius='xl'
                          variant='transparent'
                          onClick={() => setEventStartTime('')}
                          aria-label='Borrar hora de inicio'
                          tabIndex={-1}
                        >
                          <IoClose size={16} />
                        </ActionIcon>
                      ) : null
                    }
                    rightSectionWidth={30}
                  />

                  <TimeInput
                    label='Hora de fin'
                    leftSection={<GoClock size={18} />}
                    value={eventEndTime}
                    onChange={(event) => setEventEndTime(event.currentTarget.value)}
                    size='md'
                    className='w-full'
                    rightSection={
                      eventEndTime ? (
                        <ActionIcon
                          size={20}
                          radius='xl'
                          variant='transparent'
                          onClick={() => setEventEndTime('')}
                          aria-label='Borrar hora de fin'
                          tabIndex={-1}
                        >
                          <IoClose size={16} />
                        </ActionIcon>
                      ) : null
                    }
                    rightSectionWidth={30}
                  />
                </div>
                <Text size='md' fw={500} mt='sm' className='!mb-1'>
                  Categoría
                </Text>
                <div className='grid grid-cols-3 gap-2'>
                  {eventCategories.map((name) => {
                    const Icon = getCategoryIcon(name)
                    return (
                      <button
                        key={name}
                        type='button'
                        onClick={() => {
                          if (eventCategory === name) {
                            setEventCategory(null)
                          } else {
                            setEventCategory(name)
                          }
                        }}
                        className={`w-full h-20 flex flex-col items-center justify-center rounded-md border-2 bg-emerald-500 ${
                          eventCategory === name ? 'border-blue-500' : 'border-gray-300'
                        }`}
                      >
                        <Icon size={24} color='white' />
                        <span className='mt-1 text-[13px] capitalize text-white'>
                          {categoryTranslations[name]}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <Text size='sm' fw={500} ta='center' mt='sm'>
                  Subir imagen
                </Text>
                <div className='relative mx-auto w-[130px] h-[90px] mt-2'>
                  <FileButton onChange={handleEventImageChange} accept='.png, .jpg, .jpeg'>
                    {(props) => (
                      <Avatar
                        src={
                          eventImage ||
                          (eventCategory && getCategoryImage(eventCategory)) ||
                          '/images/placeholder/landscape-placeholder.svg'
                        }
                        w={130}
                        h={90}
                        radius='md'
                        className='transition cursor-pointer hover:opacity-80'
                        {...props}
                      />
                    )}
                  </FileButton>
                  {eventImage && (
                    <button
                      type='button'
                      onClick={() => setEventImage(null)}
                      className='absolute top-[-8px] right-[-8px] bg-gray-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-gray-500'
                      aria-label='Remove image'
                    >
                      ✕
                    </button>
                  )}
                </div>
                <Button type='submit' color='brand' fullWidth mt='lg'>
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
