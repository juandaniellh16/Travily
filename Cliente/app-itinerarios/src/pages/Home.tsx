import { ItineraryCard } from '@/components/ItineraryCard'
import { SearchInput } from '@/components/SearchInput'
import { itineraryService } from '@/services/itineraryService'
import { ItinerarySimpleType } from '@/types'
import { Carousel } from '@mantine/carousel'
import { Group, Loader, Skeleton } from '@mantine/core'
import { useEffect, useState } from 'react'

export const Home = () => {
  const [itineraries, setItineraries] = useState<ItinerarySimpleType[]>([])
  const [loadingItineraries, setLoadingItineraries] = useState(true)
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

    fetchPopularItineraries()
  }, [])

  return (
    <>
      <div className='flex flex-col items-center w-full px-8 pb-8 bg-white rounded-xl'>
        <h2 className='mb-4 text-2xl font-semibold text-center md:text-3xl'>
          Descubre actividades para tu viaje
        </h2>
        <SearchInput />
      </div>

      <span className='flex flex-row items-center'>
        <h2 className='text-xl font-medium md:text-2xl'>
          Itinerarios populares
        </h2>
        {loadingItineraries && <Loader color='teal' size='sm' ml='sm' />}
      </span>

      <div className='w-full mt-3 mb-8'>
        {loadingItineraries ? (
          <Group gap='xs' align='center' wrap='nowrap'>
            <Skeleton
              height={300}
              w={{
                base: '12.5%',
                xs: '22.5%',
                sm: '31%',
                md: '33%',
                lg: '24.5%',
                xl: '33.33333%'
              }}
              radius={12}
              className='!rounded-s-none xl:!rounded-s-xl'
            />
            <Skeleton
              height={300}
              w={{
                base: '75%',
                xs: '55%',
                sm: '38%',
                md: '34%',
                lg: '51%',
                xl: '33.33333%'
              }}
              radius={12}
            />
            <Skeleton
              height={300}
              w={{
                base: '12.5%',
                xs: '22.5%',
                sm: '31%',
                md: '33%',
                lg: '24.5%',
                xl: '33.33333%'
              }}
              radius={12}
              className='!rounded-e-none xl:!rounded-e-xl'
            />
          </Group>
        ) : itineraries?.length === 0 ? (
          <div className='flex items-center justify-center h-[300px] pb-[15%]'>
            <span className='text-center'>
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
          <Carousel
            height={300}
            slideSize={{
              base: '75%',
              xs: '55%',
              sm: '38%',
              md: '34%',
              lg: '51%',
              xl: '33.33333%'
            }}
            slideGap='xs'
            align='center'
            initialSlide={0}
            slidesToScroll='auto'
            loop
          >
            {itineraries.map((itinerary) => (
              <Carousel.Slide key={itinerary.id}>
                <div className='flex h-full overflow-hidden rounded-xl'>
                  <ItineraryCard itinerary={itinerary} />
                </div>
              </Carousel.Slide>
            ))}
          </Carousel>
        )}
      </div>
    </>
  )
}
