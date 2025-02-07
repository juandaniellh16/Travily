import { itineraryService } from '@/services/itineraryService'
import {
  Accordion,
  ActionIcon,
  Avatar,
  Button,
  Container,
  Group,
  Text
} from '@mantine/core'
import { useEffect, useState } from 'react'
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

const handleAddEvent = (dayId: string) => {
  console.log('Adding event to day:', dayId)
  // Lógica para añadir evento
}

const handleEditEvent = (eventId: string) => {
  console.log('Editing event with ID:', eventId)
  // Lógica para editar evento
}

const handleDeleteEvent = (eventId: string) => {
  console.log('Deleting event with ID:', eventId)
  // Lógica para eliminar evento
}

export const Itinerary = () => {
  const { itineraryId } = useParams()

  const [itineraryData, setItineraryData] = useState<ItineraryType | null>(null)

  useEffect(() => {
    const fetchItineraryData = async () => {
      try {
        if (itineraryId) {
          const data = await itineraryService.getById(itineraryId)
          setItineraryData(data)
        }
      } catch {
        console.error('Error fetching itinerary data')
      }
    }

    fetchItineraryData()
  }, [itineraryId])

  // Función para manejar el cambio de orden de los eventos
  const handleDragEnd = async (result: DropResult, dayId: string) => {
    const { source, destination } = result
    if (!destination || source.index === destination.index) return

    let updatedEvents: Event[] = []

    setItineraryData((prevData) => {
      if (!prevData) return prevData

      const newDays = [...prevData.days]
      const day = newDays.find((d) => d.id === dayId)

      if (!day) return prevData

      const [draggedEvent] = day.events.splice(source.index, 1)
      day.events.splice(destination.index, 0, draggedEvent)

      updatedEvents = day.events.map((event, index) => ({
        ...event,
        order_index: index
      }))

      return { ...prevData, days: newDays }
    })

    try {
      await itineraryService.updateEventOrder(
        itineraryId ?? '',
        dayId,
        updatedEvents
      )
    } catch {
      console.error('Error updating event order')
    }
  }

  if (!itineraryData) {
    return
  }

  return (
    <>
      <h2 className='mb-6 text-3xl font-bold text-center md:text-4xl'>
        {itineraryData?.title}
      </h2>
      <p className='text-md text-justify mb-3 px-4 text-gray-800'>
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
                                  {...provided.dragHandleProps}
                                  className='flex items-center rounded-md mb-2 cursor-grab'
                                >
                                  <FaGripVertical
                                    size={20}
                                    color='gray'
                                    className='cursor-grab mr-2'
                                  />

                                  <div className='flex items-center w-full justify-between'>
                                    <Group
                                      wrap='nowrap'
                                      gap='sm'
                                      className='flex items-center w-full'
                                    >
                                      <Avatar
                                        src={event.image ? event.image : ''}
                                        radius='md'
                                        w={130}
                                        h={90}
                                        className='object-cover flex-none'
                                      />
                                      <Container
                                        pt={4}
                                        pb={8}
                                        pl={8}
                                        h={90}
                                        className='rounded-lg bg-neutral-100 flex-grow'
                                      >
                                        <Group gap={4}>
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
                                        </Group>
                                      </Container>
                                    </Group>
                                    <div className='flex flex-col gap-2 ml-3'>
                                      <ActionIcon
                                        variant='light'
                                        color='teal'
                                        size='lg'
                                        radius='xl'
                                        aria-label='Editar'
                                        onClick={() =>
                                          handleEditEvent(event.id)
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
                                          handleDeleteEvent(event.id)
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
    </>
  )
}
