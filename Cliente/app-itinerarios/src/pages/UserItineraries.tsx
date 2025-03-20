import { ItinerariesList } from '@/components/ItinerariesList'
import { useAuth } from '@/hooks/useAuth'
import { itineraryService } from '@/services/itineraryService'
import { userService } from '@/services/userService'
import { ItinerarySimpleType, UserPublic } from '@/types'
import { ActionIcon, Loader } from '@mantine/core'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NotFound } from './NotFound'
import { IoIosArrowBack } from 'react-icons/io'

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
      setDeleteError(
        'Error al borrar el itinerario. Por favor, inténtalo de nuevo.'
      )
    }
  }

  if (notFoundError) {
    return <NotFound from='profile' />
  }

  return (
    <>
      {profileUser && (
        <div className='flex items-center gap-3'>
          <Link to={`/${profileUser.username}`}>
            <ActionIcon
              variant='filled'
              color='teal'
              size={30}
              radius='xl'
              aria-label='Back to profile'
            >
              <IoIosArrowBack size={20} strokeWidth={2} />
            </ActionIcon>
          </Link>

          <h2 className='text-xl font-medium leading-none md:text-2xl pb-0.5'>
            {location.pathname.includes('itineraries')
              ? `Itinerarios de ${profileUser.name}`
              : `Itinerarios favoritos de ${profileUser.name}`}
          </h2>
        </div>
      )}
      <div className='w-full mt-5 mb-8'>
        {loadingItineraries ? (
          <div className='flex items-center justify-center w-full my-[25%]'>
            <Loader color='teal' />
          </div>
        ) : itineraries?.length === 0 ? (
          <div className='flex items-center justify-center mt-32'>
            <span className='text-center text-gray-500'>
              {error ? (
                <>
                  No se han podido cargar los itinerarios en este momento.
                  <br />
                  Inténtalo más tarde.
                </>
              ) : (
                'No hay itinerarios'
              )}
            </span>
          </div>
        ) : (
          <ItinerariesList
            itineraries={itineraries}
            handleDelete={handleDeleteItinerary}
          />
        )}
      </div>
    </>
  )
}
