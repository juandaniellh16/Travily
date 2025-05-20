import { Image, Text, Badge, Group, Center, Avatar } from '@mantine/core'
import { LikeButton } from './LikeButton'
import { ItinerarySimpleType, UserPublic } from '@/types'
import { userService } from '@/services/userService'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { calculateTotalDays } from '@/utils'

interface ItineraryCardProps {
  itinerary: ItinerarySimpleType
}

export const ItineraryCard = ({ itinerary }: ItineraryCardProps) => {
  const [userData, setUserData] = useState<UserPublic | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userService.getById(itinerary.userId)
        setUserData(data)
      } catch {
        console.error('Error fetching user data')
      }
    }

    fetchUserData()
  }, [itinerary.userId])

  return (
    <div className='flex flex-col flex-grow rounded-xl'>
      <div className='h-[52%] min-h-[52%] rounded-xl overflow-hidden'>
        <Link to={`/itineraries/${itinerary.id}`}>
          <Image
            src={itinerary.image || '/images/placeholder/landscape-placeholder.svg'}
            h='100%'
            alt={itinerary.title}
            className='transition duration-300 transform hover:scale-105'
          />
        </Link>
      </div>

      <div className='flex flex-col justify-between flex-grow px-2'>
        <div className='flex flex-col gap-1 my-2'>
          <Link to={`/itineraries/${itinerary.id}`}>
            <Text size='sm' fw={500} lineClamp={1}>
              {itinerary.title}
            </Text>
          </Link>
          <div className='flex gap-1 mb-1'>
            <Badge variant='light' color='orange' size='sm' className='!normal-case'>
              {itinerary.location.countryName
                ? itinerary.location.name === itinerary.location.countryName
                  ? itinerary.location.name
                  : `${itinerary.location.name}, ${itinerary.location.countryName}`
                : itinerary.location.name}
            </Badge>
            <Badge variant='light' color='pink' size='sm' className='!normal-case'>
              {calculateTotalDays(itinerary.startDate, itinerary.endDate)} días
            </Badge>
          </div>

          <Text fz='sm' c='dimmed' lh={1.3} lineClamp={2}>
            {itinerary.description}
          </Text>
        </div>

        <Group justify='space-between'>
          <div className='flex items-center w-[75%] overflow-hidden'>
            <Center className='overflow-hidden'>
              <Link to={`/${userData?.username}`}>
                <Avatar
                  src={userData?.avatar || '/images/placeholder/avatar-placeholder.svg'}
                  mr='xs'
                  size={32}
                />
              </Link>
              <div className='overflow-hidden leading-none'>
                <Link to={`/${userData?.username}`}>
                  <Text truncate='end' className='!font-medium !text-xs'>
                    {userData?.name}
                  </Text>
                  <Text truncate='end' className='!text-gray-500 !text-xs'>
                    @{userData?.username}
                  </Text>
                </Link>
              </div>
            </Center>
          </div>

          <LikeButton itinerary={itinerary} />
        </Group>
      </div>
    </div>
  )
}
