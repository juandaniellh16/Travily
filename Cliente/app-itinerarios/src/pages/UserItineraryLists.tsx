import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import { ItineraryListType, UserPublic } from '@/types'
import { ActionIcon, Loader } from '@mantine/core'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { NotFound } from './NotFound'
import { IoIosArrowBack } from 'react-icons/io'
import { itineraryListService } from '@/services/itineraryListService'
import { ItineraryListsList } from '@/components/ItineraryListsList'
import { FiPlus } from 'react-icons/fi'

export const UserItineraryLists = () => {
  const { user: authUser } = useAuth()
  const { username } = useParams()
  const navigate = useNavigate()
  const [profileUser, setProfileUser] = useState<UserPublic | null>(null)
  const [itineraryLists, setItineraryLists] = useState<ItineraryListType[]>([])
  const [loadingItineraryLists, setLoadingItineraryLists] = useState(true)
  const [notFoundError, setNotFoundError] = useState(false)
  const [error, setError] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const fetchUserId = async () => {
      if (username && username !== authUser?.username) {
        try {
          const userData = await userService.getByUsername(username)
          setProfileUser(userData)
        } catch {
          console.error('Error fetching user data')
          setNotFoundError(true)
        }
      } else {
        if (authUser) {
          setProfileUser(authUser)
        }
      }
    }

    fetchUserId()
  }, [authUser, username])

  useEffect(() => {
    const fetchUserItineraryLists = async () => {
      if (profileUser) {
        try {
          const lists = await itineraryListService.getAll({
            userId: profileUser.id,
            visibility: authUser ? 'all' : 'public',
            sort: 'newest'
          })
          setItineraryLists(lists)
        } catch {
          console.error('Error fetching user itinerary lists')
          setError(true)
        } finally {
          setTimeout(() => {
            setLoadingItineraryLists(false)
          }, 500)
        }
      }
    }

    fetchUserItineraryLists()
  }, [profileUser, authUser])

  const handleDeleteItineraryList = async (id: string) => {
    try {
      await itineraryListService.delete(id)
      setItineraryLists((prev) => prev.filter((list) => list.id !== id))
    } catch {
      setDeleteError('Error al borrar la lista. Por favor, inténtalo de nuevo.')
    }
  }

  if (notFoundError) {
    return <NotFound from='profile' />
  }

  return (
    <>
      {profileUser && (
        <div className='grid items-center grid-cols-3 gap-3 py-1.5 xxs:py-1 px-1 xxs:px-1.5 rounded-t-lg bg-[#12b886]'>
          <Link
            to={`/${profileUser.username}`}
            className='group flex items-center xxs:gap-1.5 mr-auto'
          >
            {window.innerWidth > 480 ? (
              <ActionIcon
                variant='subtle'
                color='white'
                size={30}
                radius='xl'
                aria-label='Back to profile'
                className='pt-1'
              >
                <IoIosArrowBack
                  size={22}
                  strokeWidth={3}
                  className='text-gray-50'
                />
              </ActionIcon>
            ) : (
              <button>
                <IoIosArrowBack
                  size={22}
                  strokeWidth={3}
                  transform='translate(-3, 0)'
                  className='text-gray-50 group-hover:text-emerald-300 pt-0.5'
                />
              </button>
            )}

            <span className='text-sm leading-none xxs:text-md xs:text-lg text-gray-50 group-hover:text-emerald-300 xxs:group-hover:text-gray-50'>
              {profileUser.username}
            </span>
          </Link>
          <div className='text-center'>
            <h2 className='text-lg font-semibold leading-none text-white xs:text-xl'>
              Listas
            </h2>
          </div>
          <Link
            to={'/create-list'}
            className={`${
              authUser?.username === username ? 'flex' : 'hidden'
            } justify-end ml-auto group`}
          >
            {window.innerWidth > 480 ? (
              <ActionIcon
                variant='subtle'
                color='white'
                size={30}
                radius='xl'
                aria-label='Create new list'
              >
                <FiPlus size={22} strokeWidth={3} className='text-gray-50' />
              </ActionIcon>
            ) : (
              <button>
                <FiPlus
                  size={22}
                  strokeWidth={3}
                  className='text-gray-50 group-hover:text-emerald-300'
                />
              </button>
            )}
          </Link>
        </div>
      )}
      <div className='w-full mt-5 mb-8'>
        {loadingItineraryLists ? (
          <div className='flex items-center justify-center w-full my-[25%]'>
            <Loader color='teal' />
          </div>
        ) : itineraryLists?.length === 0 ? (
          <div className='flex items-center justify-center my-[25%]'>
            <span className='text-center text-gray-500'>
              {error ? (
                <>
                  No se han podido cargar las listas en este momento.
                  <br />
                  Inténtalo más tarde.
                </>
              ) : authUser?.username !== username ? (
                'No hay listas públicas'
              ) : (
                'No hay listas'
              )}
            </span>
          </div>
        ) : (
          <ItineraryListsList
            lists={itineraryLists}
            handleDelete={handleDeleteItineraryList}
          />
        )}
      </div>
    </>
  )
}
