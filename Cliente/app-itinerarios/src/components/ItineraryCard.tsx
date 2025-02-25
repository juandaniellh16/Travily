import { Card, Image, Text, Badge, Group, Center, Avatar } from '@mantine/core'
import { LikeButton } from './LikeButton'
import { ItinerarySimpleType, UserPublic } from '@/types'
import { userService } from '@/services/userService'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

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
    <Card
      className='flex flex-col flex-grow rounded-xl group'
      px={13}
      pt='md'
      pb='xs'
    >
      <Card.Section className='h-[55%] min-h-[55%] rounded-t-xl overflow-hidden'>
        <Link to={`/itineraries/${itinerary.id}`}>
          <Image
            src={itinerary.image}
            h='100%'
            alt={itinerary.title}
            className='transition duration-500 transform group-hover:scale-105'
          />
        </Link>
      </Card.Section>

      <div className='flex flex-col justify-between flex-grow'>
        <div className='flex flex-col gap-1 my-2'>
          <Link to={`/itineraries/${itinerary.id}`}>
            <Text size='sm' fw={500} lineClamp={1}>
              {itinerary.title}
            </Text>
          </Link>
          <div className='flex gap-1 mb-1'>
            <Badge size='xs' color='pink'>
              Mountain
            </Badge>
            <Badge variant='light' size='xs' key={'Sea'} leftSection={'🌊'}>
              Beach
            </Badge>
          </div>

          <Text
            fz='sm'
            c='dimmed'
            lh={1.3}
            lineClamp={2}
            className='break-words'
          >
            {itinerary.description}
          </Text>
        </div>

        <Group justify='space-between'>
          <div className='flex items-center'>
            <Center>
              <Link to={`/${userData?.username}`}>
                <Avatar
                  src={userData?.avatar || '/images/avatar-placeholder.svg'}
                  mr='xs'
                  size={32}
                />
              </Link>
              <div className='leading-none'>
                <Link to={`/${userData?.username}`}>
                  <p className='text-xs font-medium'>{userData?.name}</p>
                  <p className='text-xs text-gray-500'>@{userData?.username}</p>
                </Link>
              </div>
            </Center>
          </div>

          <LikeButton itinerary={itinerary} />
        </Group>
      </div>
    </Card>
  )
}
