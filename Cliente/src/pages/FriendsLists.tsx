import { ItineraryListsList } from '@/components/ItineraryListsList'
import { useAuth } from '@/hooks/useAuth'
import { itineraryListService } from '@/services/itineraryListService'
import { ItineraryListType } from '@/types'
import { Loader, Title } from '@mantine/core'
import { useEffect, useState } from 'react'

export const FriendsLists = () => {
  const { user: authUser } = useAuth()
  const [itineraryLists, setItineraryLists] = useState<ItineraryListType[]>([])
  const [loadingItineraryLists, setLoadingItineraryLists] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchFriendsItineraries = async () => {
      if (authUser) {
        try {
          const lists = await itineraryListService.getAll({
            followedBy: authUser.id,
            visibility: 'all',
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

    fetchFriendsItineraries()
  }, [authUser])

  return (
    <>
      <Title order={2} ta='center' mb='md'>
        Listas recientes de tus amigos
      </Title>
      <div className='w-full mt-5 mb-8'>
        {loadingItineraryLists ? (
          <div className='flex items-center justify-center w-full my-[25%]'>
            <Loader color='brand' />
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
              ) : (
                'No se encontraron listas.'
              )}
            </span>
          </div>
        ) : (
          <ItineraryListsList lists={itineraryLists} handleDelete={() => {}} />
        )}
      </div>
    </>
  )
}
