import { ItinerariesCarousel } from '@/components/ItinerariesCarousel'
import { PopularDestinations } from '@/components/PopularDestinations'
import { SearchInput } from '@/components/SearchInput'
import { useAuth } from '@/hooks/useAuth'
import { itineraryService } from '@/services/itineraryService'
import { ItinerarySimpleType } from '@/types'
import { Group, Loader, Skeleton } from '@mantine/core'
import { useEffect, useState } from 'react'

export const Home = () => {
  const { user } = useAuth()
  const [itineraries, setItineraries] = useState<ItinerarySimpleType[]>([])
  const [friendsItineraries, setFriendsItineraries] = useState<ItinerarySimpleType[]>([])
  const [loadingItineraries, setLoadingItineraries] = useState(true)
  const [loadingFriendsItineraries, setLoadingFriendsItineraries] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPopularItineraries = async () => {
      try {
        const itineraries = await itineraryService.getAll({ sort: 'popular' })
        setItineraries(itineraries)
      } catch {
        console.error('Error fetching popular itineraries')
        setError(true)
      } finally {
        setTimeout(() => {
          setLoadingItineraries(false)
        }, 250)
      }
    }

    const fetchFriendsItineraries = async () => {
      if (user) {
        try {
          const itineraries = await itineraryService.getAll({
            sort: 'newest',
            followedBy: user.id
          })
          setFriendsItineraries(itineraries)
        } catch {
          console.error('Error fetching itineraries from followed users')
          setError(true)
        } finally {
          setTimeout(() => {
            setLoadingFriendsItineraries(false)
          }, 250)
        }
      }
    }

    fetchPopularItineraries()
    fetchFriendsItineraries()
  }, [user])

  return (
    <>
      <div className='flex flex-col items-center w-full px-5 pb-8'>
        <h1 className='mb-4 text-4xl font-bold text-center md:text-5xl'>
          Planifica tus viajes <br className='hidden xxs:block' />
          con <span className='text-brand-500'>Travily</span>
        </h1>
        <h2 className='mb-6 text-lg text-center md:text-xl'>
          La red social para crear, compartir y descubrir itinerarios de viaje
        </h2>
        <SearchInput />
      </div>
      <span className='flex flex-row items-center'>
        <h2 className='text-xl font-medium md:text-2xl'>Populares esta semana</h2>
        {loadingItineraries && <Loader color='brand' size='sm' ml='sm' />}
      </span>
      <div className='w-full mt-3 mb-8'>
        {loadingItineraries ? (
          <Group gap='xs' align='center' wrap='nowrap'>
            <Skeleton
              height={295}
              w={{
                base: '12.5%',
                xxs: '17.5%',
                xs: '22.5%',
                sm: '30%',
                md: '33%',
                lg: '33.33333%',
                lg72rem: '24.5%',
                xl: '33.33333%'
              }}
              radius={12}
              className='!rounded-s-none xl:!rounded-s-xl'
            />
            <Skeleton
              height={295}
              w={{
                base: '75%',
                xxs: '65%',
                xs: '55%',
                sm: '40%',
                md: '34%',
                lg: '33.33333%',
                lg72rem: '51%',
                xl: '33.33333%'
              }}
              radius={12}
            />
            <Skeleton
              height={295}
              w={{
                base: '12.5%',
                xxs: '17.5%',
                xs: '22.5%',
                sm: '30%',
                md: '33%',
                lg: '33.33333%',
                lg72rem: '24.5%',
                xl: '33.33333%'
              }}
              radius={12}
              className='!rounded-e-none xl:!rounded-e-xl'
            />
          </Group>
        ) : itineraries?.length === 0 ? (
          <div className='flex items-center justify-center h-[295px] pb-[15%]'>
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
          <ItinerariesCarousel itineraries={itineraries} />
        )}
      </div>

      <h2 className='text-xl font-medium md:text-2xl'>Destinos populares</h2>
      <PopularDestinations />

      {user && user.following > 0 && (
        <>
          <span className='flex flex-row items-center'>
            <h2 className='text-xl font-medium md:text-2xl'>Novedades de tus amigos</h2>
            {loadingFriendsItineraries && <Loader color='brand' size='sm' ml='sm' />}
          </span>
          <div className='w-full mt-3 mb-8'>
            {loadingFriendsItineraries ? (
              <Group gap='xs' align='center' wrap='nowrap'>
                <Skeleton
                  height={295}
                  w={{
                    base: '12.5%',
                    xxs: '17.5%',
                    xs: '22.5%',
                    sm: '30%',
                    md: '33%',
                    lg: '33.33333%',
                    lg72rem: '24.5%',
                    xl: '33.33333%'
                  }}
                  radius={12}
                  className='!rounded-s-none xl:!rounded-s-xl'
                />
                <Skeleton
                  height={295}
                  w={{
                    base: '75%',
                    xxs: '65%',
                    xs: '55%',
                    sm: '40%',
                    md: '34%',
                    lg: '33.33333%',
                    lg72rem: '51%',
                    xl: '33.33333%'
                  }}
                  radius={12}
                />
                <Skeleton
                  height={295}
                  w={{
                    base: '12.5%',
                    xxs: '17.5%',
                    xs: '22.5%',
                    sm: '30%',
                    md: '33%',
                    lg: '33.33333%',
                    lg72rem: '24.5%',
                    xl: '33.33333%'
                  }}
                  radius={12}
                  className='!rounded-e-none xl:!rounded-e-xl'
                />
              </Group>
            ) : friendsItineraries?.length === 0 ? (
              <div className='flex items-center justify-center h-[295px] pb-[15%]'>
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
              <ItinerariesCarousel itineraries={friendsItineraries} />
            )}
          </div>
        </>
      )}
    </>
  )
}
