import { ItinerariesList } from '@/components/itineraries/ItinerariesList'
import { useAuth } from '@/hooks/useAuth'
import { itineraryService } from '@/services/itineraryService'
import { userService } from '@/services/userService'
import { ItineraryListType, UserPublic } from '@/types'
import {
  ActionIcon,
  Avatar,
  FileButton,
  Group,
  Loader,
  Menu,
  Switch,
  Text,
  Textarea,
  TextInput
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { NotFound } from './NotFound'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { MdEdit, MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md'
import { IoTrashOutline } from 'react-icons/io5'
import { ShareButton } from '@/components/ui/ShareButton'
import { API_BASE_URL } from '@/config/config'
import { itineraryListService } from '@/services/itineraryListService'
import { Unauthorized } from './Unauthorized'
import { LikeButton } from '@/components/itineraries/LikeButton'

export const ItineraryList = () => {
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const { listId } = useParams()
  const [listData, setListData] = useState<ItineraryListType | null>(null)
  const [userData, setUserData] = useState<UserPublic | null>(null)

  const [isEditingList, setIsEditingList] = useState(false)
  const [listTitle, setListTitle] = useState('')
  const [isEditingListTitle, setIsEditingListTitle] = useState(false)
  const [listDescription, setListDescription] = useState('')
  const [isEditingListDescription, setIsEditingListDescription] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const [notFoundError, setNotFoundError] = useState(false)
  const [unauthorizedError, setUnauthorizedError] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const handleListTitleBlur = () => {
    if (listId && listTitle !== listData?.title) {
      handleEditList(listId, {
        title: listTitle.replace(/\s+/g, ' ').trim()
      })
    }
    setIsEditingListTitle(false)
  }

  const handleListTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListTitle(e.target.value)
  }

  const handleListDescriptionBlur = () => {
    if (listId && listDescription !== listData?.description) {
      handleEditList(listId, {
        description: listDescription.replace(/\s+/g, ' ').trim()
      })
    }
    setIsEditingListDescription(false)
  }

  const handleListDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setListDescription(e.target.value)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (isEditingListTitle) {
        handleListTitleBlur()
      } else if (isEditingListDescription) {
        handleListDescriptionBlur()
      }
    }
  }

  const handleListImageChange = async (file: File | null) => {
    if (file) {
      try {
        const formData = new FormData()
        const fileName = `${authUser?.username}-${Date.now()}`
        const customFile = new File([file], fileName, { type: file.type })
        formData.append('file', customFile)

        const response = await fetch(`${API_BASE_URL}/upload/list-image`, {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        if (data.listImageUrl) {
          if (listId && data.listImageUrl !== listData?.image) {
            handleEditList(listId, { image: data.listImageUrl })
          }
        }
      } catch {
        setError('Failed to upload list image')
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (listId) {
          const localListData = await itineraryListService.getById(listId)
          setListData(localListData)
          setIsPublic(localListData.isPublic)

          if (localListData.userId) {
            const localUserData = await userService.getById(localListData.userId)
            setUserData(localUserData)
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
              setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
          }
        } else {
          setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
        }
      }
    }

    fetchData()
  }, [listId, setNotFoundError])

  const handleDeleteList = async () => {
    try {
      if (listId) {
        await itineraryListService.delete(listId)
        navigate('/')
      }
    } catch {
      setError('Error deleting itinerary list')
    }
  }

  const handleVisibilityChange = async () => {
    try {
      if (listId) {
        const newVisibility = !isPublic
        setIsPublic(newVisibility)
        await itineraryListService.update(listId, { isPublic: newVisibility })
      }
    } catch {
      setError('Error changing itinerary list visibility')
    }
  }

  const handleEditList = async (listId: string, updatedListData: Partial<ItineraryListType>) => {
    if (!listData) return

    try {
      await itineraryListService.update(listId, updatedListData)
      setListData((prevData) => {
        if (!prevData) return prevData

        return {
          ...prevData,
          ...updatedListData
        }
      })
    } catch {
      console.error('Error updating itinerary list')
    }
  }

  const handleDeleteItinerary = async (id: string) => {
    try {
      await itineraryService.delete(id)
      setListData((prev) => {
        if (!prev) return prev

        return {
          ...prev,
          itineraries: prev.itineraries.filter((itinerary) => itinerary.id !== id)
        }
      })
    } catch {
      setDeleteError('Error al borrar el itinerario. Por favor, inténtalo de nuevo.')
    }
  }

  const handleRemoveFromList = async (itineraryId: string) => {
    if (!listId || !itineraryId) return
    try {
      await itineraryListService.removeItineraryFromList(listId, itineraryId)
      setListData((prev) => {
        if (!prev) return prev

        return {
          ...prev,
          itineraries: prev.itineraries.filter((itinerary) => itinerary.id !== itineraryId)
        }
      })
    } catch {
      console.error('Error removing itinerary from list')
    }
  }

  if (notFoundError) {
    return <NotFound from='itinerary' />
  }
  if (unauthorizedError) {
    return <Unauthorized />
  }
  if (!listData) {
    return (
      <div className='flex items-center justify-center w-full h-full my-[25%]'>
        <Loader color='brand' />
      </div>
    )
  }

  return (
    <>
      <div className='relative flex justify-center w-full mb-16'>
        {isEditingList ? (
          <FileButton
            onChange={(file) => {
              handleListImageChange(file)
            }}
            accept='.png, .jpg, .jpeg'
          >
            {(props) => (
              <img
                src={listData.image || '/images/placeholder/landscape-placeholder.svg'}
                alt={listData.title}
                className='w-full h-[250px] object-cover rounded-t-xl transition cursor-pointer hover:opacity-80'
                {...props}
              />
            )}
          </FileButton>
        ) : (
          <img
            src={listData.image || '/images/placeholder/landscape-placeholder.svg'}
            alt={listData.title}
            className='w-full h-[250px] object-cover rounded-t-xl'
          />
        )}

        <div className='absolute bottom-[-20%] p-4 flex flex-col bg-white rounded-lg shadow-md w-[80%]'>
          <div className='flex items-center justify-between w-full mb-4'>
            {isEditingListTitle ? (
              <TextInput
                value={listTitle}
                onChange={handleListTitleChange}
                onBlur={handleListTitleBlur}
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
                  isEditingList ? 'rounded-md hover:bg-neutral-100' : ''
                }`}
                onClick={() => {
                  if (isEditingList) {
                    setListTitle(listData.title)
                    setIsEditingListTitle(true)
                  }
                }}
              >
                {listTitle || listData.title || 'Sin título'}
              </h2>
            )}

            {listData.userId === authUser?.id && (
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
                  {isEditingList ? (
                    <Menu.Item
                      leftSection={<MdEdit size={14} />}
                      onClick={() => setIsEditingList(false)}
                    >
                      Dejar de editar
                    </Menu.Item>
                  ) : (
                    <Menu.Item
                      leftSection={<MdEdit size={14} />}
                      onClick={() => setIsEditingList(true)}
                    >
                      Editar lista
                    </Menu.Item>
                  )}

                  {listData.userId === authUser?.id && (
                    <>
                      <Menu.Item
                        color='red'
                        leftSection={<IoTrashOutline size={14} />}
                        onClick={() => handleDeleteList()}
                      >
                        Borrar lista
                      </Menu.Item>

                      <Menu.Divider />

                      <Switch
                        size='sm'
                        color='brand'
                        onLabel={<MdOutlineVisibility size={18} />}
                        offLabel={<MdOutlineVisibilityOff size={18} />}
                        label={isPublic ? 'Pública' : 'Privada'}
                        checked={isPublic}
                        onChange={handleVisibilityChange}
                        className='flex justify-center mt-3.5 mb-2 text-gray-500'
                      />
                    </>
                  )}
                </Menu.Dropdown>
              </Menu>
            )}
          </div>
          {isEditingListDescription ? (
            <Textarea
              ref={(el) => {
                if (el) {
                  const length = listDescription.length
                  el.setSelectionRange(length, length)
                }
              }}
              value={listDescription}
              onChange={handleListDescriptionChange}
              onBlur={handleListDescriptionBlur}
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
                isEditingList ? 'rounded-md hover:bg-neutral-100' : ''
              }`}
              onClick={() => {
                if (isEditingList) {
                  setListDescription(listData.description)
                  setIsEditingListDescription(true)
                }
              }}
            >
              {isEditingList && !(listDescription || listData.description)
                ? 'Añade una descripción...'
                : listDescription || listData.description}
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
            </div>
            <Group gap={0}>
              <LikeButton itineraryList={listData} />
              <ShareButton />
            </Group>
          </div>
        </div>
      </div>
      {error && <p className='mb-2 text-center text-red-500'>{error}</p>}
      {deleteError && <p className='mb-2 text-center text-red-500'>{deleteError}</p>}
      <div className='w-full mt-5 mb-8'>
        <ItinerariesList
          itineraries={listData.itineraries}
          handleDelete={handleDeleteItinerary}
          fromOwnerList={listData.userId === authUser?.id}
          handleRemoveFromList={handleRemoveFromList}
        />
      </div>
    </>
  )
}
