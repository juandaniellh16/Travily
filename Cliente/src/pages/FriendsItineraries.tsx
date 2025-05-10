import { ItinerariesList } from '@/components/ItinerariesList'
import { useAuth } from '@/hooks/useAuth'
import { itineraryService } from '@/services/itineraryService'
import { ItinerarySimpleType } from '@/types'
import { Loader, Title } from '@mantine/core'
import { useEffect, useState } from 'react'

export const FriendsItineraries = () => {
  const { user: authUser } = useAuth()
  const [itineraries, setItineraries] = useState<ItinerarySimpleType[]>([])
  const [loadingItineraries, setLoadingItineraries] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchFriendsItineraries = async () => {
      if (authUser) {
        try {
          const itineraries = await itineraryService.getAll({
            followedBy: authUser.id,
            visibility: 'all',
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
      }
    }

    fetchFriendsItineraries()
  }, [authUser])

  return (
    <>
      <Title order={2} ta='center' mb='md'>
        Itinerarios recientes de tus amigos
      </Title>
      <div className='w-full mt-5 mb-8'>
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
                'No se encontraron itinerarios.'
              )}
            </span>
          </div>
        ) : (
          <ItinerariesList itineraries={itineraries} handleDelete={() => {}} />
        )}
      </div>
    </>
  )
}
