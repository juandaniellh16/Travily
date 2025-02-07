import { ItineraryCard } from '@/components/ItineraryCard'
import { SearchInput } from '@/components/SearchInput'
import { itineraryService } from '@/services/itineraryService'
import { ItinerarySimpleType } from '@/types'
import { Carousel } from '@mantine/carousel'
import { useEffect, useState } from 'react'

export const Home = () => {
  const [itineraries, setItineraries] = useState<ItinerarySimpleType[]>([])

  useEffect(() => {
    const fetchPopularItineraries = async () => {
      try {
        const itineraries = await itineraryService.getPopularItineraries()
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

      <div className='w-full my-8'>
        <Carousel
          height={300}
          slideSize={{ base: '60%', sm: '45%', md: '55%', lg: '33.33333%' }}
          slideGap='xs'
          align='center'
          initialSlide={1}
          slidesToScroll='auto'
          loop
        >
          {itineraries.map((itinerary) => (
            <Carousel.Slide key={itinerary.id}>
              <ItineraryCard itinerary={itinerary} />
            </Carousel.Slide>
          ))}
        </Carousel>
      </div>
    </>
  )
}
