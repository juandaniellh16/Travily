import { Carousel } from '@mantine/carousel'
import { ItineraryCard } from './ItineraryCard'
import { ItinerarySimpleType } from '@/types'

export const ItinerariesCarousel = ({ itineraries }: { itineraries: ItinerarySimpleType[] }) => {
  return (
    <Carousel
      height={295}
      slideSize={{
        base: '75%',
        xxs: '65%',
        xs: '55%',
        sm: '40%',
        md: '34%',
        lg: '27%',
        lg72rem: '51%',
        xl: '33.33333%'
      }}
      slideGap='xs'
      align='center'
      slidesToScroll='auto'
      withControls={window.innerWidth > 640}
      dragFree
      loop
      className='group'
      classNames={{
        control:
          '!opacity-0 group-hover:!opacity-100 !transition-opacity !duration-300 -mt-4 -mx-1 w-7 h-7'
      }}
    >
      {itineraries.map((itinerary) => (
        <Carousel.Slide key={itinerary.id}>
          <div className='flex h-full overflow-hidden rounded-xl'>
            <ItineraryCard itinerary={itinerary} />
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  )
}
