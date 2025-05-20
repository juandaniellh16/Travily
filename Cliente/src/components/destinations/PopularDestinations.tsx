import { Carousel } from '@mantine/carousel'
import { Link } from 'react-router'

const destinations = [
  {
    name: 'Londres',
    image: '/images/destinations/londres.jpg'
  },
  {
    name: 'Paris',
    image: '/images/destinations/paris.jpg'
  },
  {
    name: 'Roma',
    image: '/images/destinations/roma.jpg'
  },
  {
    name: 'Tokio',
    image: '/images/destinations/tokio.jpg'
  },
  {
    name: 'Madrid',
    image: '/images/destinations/madrid.jpg'
  },
  {
    name: 'Praga',
    image: '/images/destinations/praga.jpg'
  },
  {
    name: 'Nueva York',
    image: '/images/destinations/nueva-york.jpg'
  },
  {
    name: 'Florencia',
    image: '/images/destinations/florencia.jpg'
  }
]

export const PopularDestinations = () => {
  return (
    <Carousel
      slideSize={{
        base: '37%',
        xs: '27%',
        sm: '22%',
        md: '22%',
        lg: '27%',
        xl: '22%'
      }}
      height={140}
      slideGap='xs'
      align='start'
      slidesToScroll='auto'
      withControls={window.innerWidth > 640}
      dragFree
      className='mt-3 mb-8 group'
      classNames={{
        control:
          '!opacity-0 group-hover:!opacity-100 !transition-opacity !duration-300 -mx-1 w-7 h-7'
      }}
    >
      {destinations.map((destination) => (
        <Carousel.Slide key={destination.name}>
          <div className='flex h-full overflow-hidden transition-transform duration-300 transform rounded-lg hover:scale-95'>
            <Link
              to={`/search?q=${destination.name}&type=itinerary`}
              className='relative w-full h-full'
            >
              <img
                src={destination.image}
                alt={destination.name}
                className='object-cover w-full h-full'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent'></div>
              <div className='absolute left-0 w-full font-semibold text-center text-white bottom-2'>
                {destination.name}
              </div>
            </Link>
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  )
}
