import { ItineraryCard } from '@/components/ItineraryCard'
import { SearchInput } from '@/components/SearchInput'
import { itineraryService } from '@/services/itineraryService'
import { ItinerarySimpleType } from '@/types'
import { Carousel } from '@mantine/carousel'
import { Group, Loader, Skeleton } from '@mantine/core'
import { useEffect, useState } from 'react'

export const Home = () => {
  const [itineraries, setItineraries] = useState<ItinerarySimpleType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const fetchPopularItineraries = async () => {
      try {
        const itineraries = await itineraryService.getAll({ sort: 'popular' })
        setItineraries(itineraries)
      } catch {
        console.error('Error fetching popular itineraries')
      }
    }

    fetchPopularItineraries()
  }, [])

  return (
    <>
      <div className='flex flex-col items-center w-full px-8 pb-8 bg-white rounded-xl'>
        <h2 className='mb-4 text-2xl font-medium text-center md:text-3xl'>
          Descubre actividades para tu viaje
        </h2>
        <SearchInput />
      </div>

      <span className='flex flex-row items-center'>
        <h2 className='text-xl font-medium md:text-2xl'>
          Itinerarios populares
        </h2>
        {(loading || itineraries.length === 0) && (
          <Loader color='teal' size='sm' ml='sm' />
        )}
      </span>

      <div className='w-full mt-3 mb-8'>
        {loading || itineraries.length === 0 ? (
          <Group gap='xs' align='center' wrap='nowrap'>
            <Skeleton animate={loading} height={300} radius={12} />
            <Skeleton animate={loading} height={300} radius={12} />
            <Skeleton animate={loading} height={300} radius={12} />
          </Group>
        ) : (
          <Carousel
            height={300}
            slideSize={{ base: '60%', sm: '45%', md: '55%', lg: '33.33333%' }}
            slideGap='xs'
            align='center'
            initialSlide={0}
            slidesToScroll='auto'
            loop
          >
            {itineraries.map((itinerary) => (
              <Carousel.Slide key={itinerary.id}>
                <ItineraryCard itinerary={itinerary} />
              </Carousel.Slide>
            ))}
          </Carousel>
        )}
      </div>
    </>
  )
}
