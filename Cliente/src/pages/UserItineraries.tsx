import { ItinerariesList } from '@/components/ItinerariesList'
import { useAuth } from '@/hooks/useAuth'
import { itineraryService } from '@/services/itineraryService'
import { userService } from '@/services/userService'
import { ItinerarySimpleType, UserPublic } from '@/types'
import { ActionIcon, Loader, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { NotFound } from './NotFound'
import { IoIosArrowBack } from 'react-icons/io'
import { FiPlus } from 'react-icons/fi'

export const UserItineraries = () => {
  const { user: authUser } = useAuth()
  const { username } = useParams()
  const [profileUser, setProfileUser] = useState<UserPublic | null>(null)
  const [itineraries, setItineraries] = useState<ItinerarySimpleType[]>([])
  const [loadingItineraries, setLoadingItineraries] = useState(true)
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
    const fetchUserItineraries = async () => {
      if (profileUser) {
        if (location.pathname.includes('itineraries')) {
          try {
            const itineraries = await itineraryService.getAll({
              userId: profileUser.id,
              visibility: authUser ? 'all' : 'public',
              sort: 'newest'
            })
            setItineraries(itineraries)
          } catch {
            console.error('Error fetching user itineraries')
            setError(true)
          } finally {
            setTimeout(() => {
              setLoadingItineraries(false)
            }, 500)
          }
        } else if (location.pathname.includes('favorites')) {
          try {
            const itineraries = await itineraryService.getAll({
              likedBy: profileUser.id,
              visibility: authUser ? 'all' : 'public',
              sort: 'newest'
            })
            setItineraries(itineraries)
          } catch {
            console.error('Error fetching user liked itineraries')
            setError(true)
          } finally {
            setTimeout(() => {
              setLoadingItineraries(false)
            }, 500)
          }
        }
      }
    }

    fetchUserItineraries()
  }, [profileUser, authUser])

  const handleDeleteItinerary = async (id: string) => {
    try {
      await itineraryService.delete(id)
      setItineraries((prev) => prev.filter((itinerary) => itinerary.id !== id))
    } catch {
      setDeleteError('Error al borrar el itinerario. Por favor, inténtalo de nuevo.')
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
            className='group flex items-center xxs:gap-1.5 mr-auto w-[110%] overflow-hidden'
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
                <IoIosArrowBack size={22} strokeWidth={3} className='text-gray-50' />
              </ActionIcon>
            ) : (
              <button>
                <IoIosArrowBack
                  size={22}
                  strokeWidth={3}
                  transform='translate(-3, 0)'
                  className='text-gray-50 group-hover:text-brand-300 pt-0.5'
                />
              </button>
            )}
            <Text
              truncate='end'
              className='!text-sm !leading-tight xxs:!text-md xs:!text-lg !text-gray-50 xxs:group-hover:!text-gray-50 group-hover:!text-brand-300'
            >
              {profileUser.username}
            </Text>
          </Link>
          <div className='text-center'>
            <h2 className='text-lg font-semibold leading-none text-white xs:text-xl'>
              {location.pathname.includes('itineraries') ? `Itinerarios` : `Favoritos`}
            </h2>
          </div>
          <Link
            to={'/create-itinerary'}
            className={`${
              location.pathname.includes('itineraries') && authUser?.username === username
                ? 'flex'
                : 'hidden'
            } justify-end ml-auto group`}
          >
            {window.innerWidth > 480 ? (
              <ActionIcon
                variant='subtle'
                color='white'
                size={30}
                radius='xl'
                aria-label='Create new itinerary'
              >
                <FiPlus size={22} strokeWidth={3} className='text-gray-50' />
              </ActionIcon>
            ) : (
              <button>
                <FiPlus
                  size={22}
                  strokeWidth={3}
                  className='text-gray-50 group-hover:text-brand-300'
                />
              </button>
            )}
          </Link>
        </div>
      )}
      <div className='w-full mt-5 mb-8'>
        {deleteError && <p className='mb-2 text-center text-red-500'>{deleteError}</p>}
        {loadingItineraries ? (
          <div className='flex items-center justify-center w-full my-[25%]'>
            <Loader color='brand' />
          </div>
        ) : itineraries?.length === 0 ? (
          <div className='flex items-center justify-center my-[25%]'>
            <span className='text-center text-gray-500'>
              {error ? (
                <>
                  No se han podido cargar los itinerarios en este momento.
                  <br />
                  Inténtalo más tarde.
                </>
              ) : (
                `${
                  location.pathname.includes('itineraries')
                    ? authUser?.username !== username
                      ? 'No hay itinerarios públicos'
                      : 'No hay itinerarios'
                    : 'No hay favoritos'
                }`
              )}
            </span>
          </div>
        ) : (
          <ItinerariesList itineraries={itineraries} handleDelete={handleDeleteItinerary} />
        )}
      </div>
    </>
  )
}
