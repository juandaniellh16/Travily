import { Carousel } from '@mantine/carousel'
import { Link } from 'react-router'

const destinations = [
  {
    name: 'Londres',
    image:
      'https://assets.editorial.aetnd.com/uploads/2019/03/topic-london-gettyimages-760251843-feature.jpg'
  },
  {
    name: 'Paris',
    image: 'https://a.eu.mktgcdn.com/f/100004519/N2BB4ohwclor2uLoZ7XMHgJmxOZaMOokMdQqqXQAq3s.jpg'
  },
  {
    name: 'Roma',
    image:
      'https://media.gq-magazine.co.uk/photos/5d13a3a9b6fee91a87c9f87f/16:9/w_2560%2Cc_limit/Rome-hp-GQ-24May16_istock_b.jpg'
  },
  {
    name: 'Tokio',
    image:
      'https://media.audleytravel.com/-/media/images/home/north-asia-and-russia/japan/activities/tokyo-gettyimages-1131743616-1000x3000.jpg?q=79&w=1920&h=685'
  },
  {
    name: 'Madrid',
    image:
      'https://content.r9cdn.net/rimg/dimg/5f/38/353ec907-ap-MAD-551b0685.jpg?width=1366&height=768&xhint=826&yhint=409&crop=true'
  },
  {
    name: 'Praga',
    image:
      'https://images.pexels.com/photos/161077/prague-vencel-square-czech-republic-church-161077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  },
  {
    name: 'Nueva York',
    image: 'https://gentleman.com.mx/wp-content/uploads/2024/10/new-york.jpeg'
  },
  {
    name: 'Florencia',
    image:
      'https://tourismmedia.italia.it/is/image/mitur/20210401173629-firenze-toscana-gettyimages-1145040590-1?wid=1600&hei=900&fit=constrain,1&fmt=webp'
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
