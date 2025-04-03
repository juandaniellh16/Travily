import {
  Image,
  Text,
  Badge,
  Group,
  Center,
  Avatar,
  ActionIcon,
  Menu,
  TextInput,
  Button,
  Switch,
  Modal,
  Title,
  Loader,
  ScrollArea
} from '@mantine/core'
import { LikeButton } from './LikeButton'
import { ItineraryListType, ItinerarySimpleType, UserPublic } from '@/types'
import { userService } from '@/services/userService'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IoTrashOutline } from 'react-icons/io5'
import { LuCalendarDays } from 'react-icons/lu'
import { useAuth } from '@/hooks/useAuth'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { FaUsers } from 'react-icons/fa'
import { itineraryService } from '@/services/itineraryService'
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md'
import { calculateTotalDays } from '@/utils'
import { ShareButton } from './ShareButton'
import { useDisclosure } from '@mantine/hooks'
import { itineraryListService } from '@/services/itineraryListService'
import { FiMinus, FiPlus } from 'react-icons/fi'

interface ItineraryCardLargeProps {
  itinerary: ItinerarySimpleType
  handleDelete: (id: string) => void
  fromOwnerList: boolean
  handleRemoveFromList?: (id: string) => void
}

export const ItineraryCardLarge = ({
  itinerary,
  handleDelete,
  fromOwnerList = false,
  handleRemoveFromList
}: ItineraryCardLargeProps) => {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserPublic | null>(null)

  const [isPublic, setIsPublic] = useState(false)
  const [collaboratorUsername, setCollaboratorUsername] = useState('')
  const [collaboratorError, setCollaboratorError] = useState('')

  const [addToListOpened, addToListDisclosure] = useDisclosure(false)
  const [userLists, setUserLists] = useState<ItineraryListType[] | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userService.getById(itinerary.userId)
        setUserData(data)
      } catch {
        console.error('Error fetching user data')
      }
    }

    fetchUserData()
  }, [itinerary])

  const handleVisibilityChange = async () => {
    try {
      const newVisibility = !isPublic
      setIsPublic(newVisibility)
      await itineraryService.update(itinerary.id, { isPublic: newVisibility })
    } catch {
      console.error('Error changing itinerary visibility')
    }
  }

  const handleAddCollaborator = async () => {
    if (!collaboratorUsername) {
      setCollaboratorError('Por favor, ingresa un nombre de usuario.')
      return
    }
    try {
      await itineraryService.addCollaborator(itinerary.id, collaboratorUsername)

      setCollaboratorUsername('')
      setCollaboratorError('')
    } catch {
      setCollaboratorError(
        'Error al añadir colaborador. Por favor, inténtalo de nuevo.'
      )
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
    if (!itinerary || !listId) return
    try {
      await itineraryListService.addItineraryToList(listId, itinerary.id)
      closeAddToListModal()
    } catch {
      console.error('Error adding itinerary to list')
    }
  }

  return (
    <>
      <div className='flex flex-row overflow-hidden h-[121px] sm:h-[136px] rounded-lg shadow-sm bg-neutral-100'>
        <div className='w-[35%] xxs:w-[30%] overflow-hidden'>
          <Link to={`/itineraries/${itinerary.id}`}>
            <Image
              src={itinerary.image || '/images/landscape-placeholder.svg'}
              alt={itinerary.title}
              className='object-cover w-full h-full'
            />
          </Link>
        </div>

        <div className='flex flex-col justify-between w-[70%] px-3 sm:px-5 py-2.5 gap-2'>
          <span>
            <div className='flex items-center justify-between mb-1.5 w-full'>
              <div className='items-center gap-3.5 sm:flex'>
                <Link to={`/itineraries/${itinerary.id}`}>
                  <Text
                    fw={500}
                    lineClamp={1}
                    lh={1.3}
                    className='!text-[14.5px] sm:!text-[16px] sm:!mb-0.5'
                  >
                    {itinerary.title}
                  </Text>
                </Link>

                <div className='flex flex-shrink-0 gap-1 mt-1 sm:mt-0'>
                  <Badge variant='light' color='orange' size='xs'>
                    {itinerary.locations[0]}
                  </Badge>
                  <Badge variant='light' color='pink' size='xs'>
                    {calculateTotalDays(itinerary.startDate, itinerary.endDate)}{' '}
                    días
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
                      color='teal'
                      className='self-start'
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
                    {fromOwnerList && (
                      <Menu.Item
                        color='red'
                        leftSection={<FiMinus size={15} strokeWidth={3} />}
                        onClick={() => handleRemoveFromList?.(itinerary.id)}
                      >
                        Eliminar de la lista
                      </Menu.Item>
                    )}
                    {itinerary?.userId === user?.id && (
                      <>
                        <Menu.Divider />
                        <Menu.Item
                          color='red'
                          leftSection={<IoTrashOutline size={14} />}
                          onClick={() => handleDelete(itinerary.id)}
                        >
                          Borrar itinerario
                        </Menu.Item>
                        <Menu.Divider />
                        <div className='px-4 pt-4'>
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
                          className='flex justify-center mt-4 mb-2.5 text-gray-500'
                        />
                      </>
                    )}
                  </Menu.Dropdown>
                </Menu>
              )}
            </div>

            <div className='flex items-center gap-2 sm:mb-2.5 text-xs text-gray-500'>
              <LuCalendarDays size={16} strokeWidth={1.5} />
              <p>
                {new Date(itinerary.startDate).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit'
                })}
                {' - '}
                {new Date(itinerary.endDate).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit'
                })}{' '}
                {new Date(itinerary.endDate).getFullYear()}
              </p>
            </div>

            <Text
              fz='sm'
              c='dimmed'
              lh={1.3}
              className='hidden sm:block sm:!line-clamp-1'
            >
              {itinerary.description}
            </Text>
          </span>

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
              <LikeButton itinerary={itinerary} />
              <ShareButton
                url={`https://miapp.com/itineraries/${itinerary.id}`}
              />
            </Group>
          </div>
        </div>
      </div>
      <Modal
        opened={addToListOpened}
        onClose={closeAddToListModal}
        size='md'
        radius='lg'
        centered
        scrollAreaComponent={ScrollArea.Autosize.withProps({
          scrollbars: false
        })}
      >
        <div className='flex flex-col h-[70vh]'>
          <Title order={2} ta='center' mb='lg' className='sticky top-0 z-10'>
            Selecciona una lista
          </Title>
          <div className='overflow-y-auto max-h-[70vh]'>
            <div className='px-8'>
              {!userLists ? (
                <div className='flex items-center justify-center w-full my-[25%]'>
                  <Loader color='teal' />
                </div>
              ) : userLists.length === 0 ? (
                <p className='mt-6 text-center text-gray-500'>
                  No tienes listas disponibles
                </p>
              ) : (
                <>
                  {userLists.map((list) => (
                    <Button
                      key={list.id}
                      fullWidth
                      variant='light'
                      color='teal'
                      onClick={() => handleAddToList(list.id)}
                      className='mb-2'
                    >
                      {list.title}
                    </Button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
