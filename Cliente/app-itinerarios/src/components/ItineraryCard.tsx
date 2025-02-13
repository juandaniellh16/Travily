import {
  Card,
  Image,
  Text,
  Badge,
  ActionIcon,
  Group,
  Center,
  Avatar
} from '@mantine/core'
import { IoShareSocialSharp } from 'react-icons/io5'
import { LikeButton } from './LikeButton'
import { ItinerarySimpleType, User } from '@/types'
import { userService } from '@/services/userService'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface ItineraryCardProps {
  itinerary: ItinerarySimpleType
}

export const ItineraryCard = ({ itinerary }: ItineraryCardProps) => {
  const [userData, setUserData] = useState<User | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userService.getUserData(itinerary.userId)
        setUserData(data)
      } catch {
        console.error('Error fetching user data')
      }
    }

    fetchUserData()
  }, [itinerary.userId])

  return (
    <div className='flex h-full overflow-hidden rounded-xl'>
      <Card className='flex flex-col flex-grow rounded-xl group' padding='md'>
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
            <Text fz='sm' c='dimmed' lh={1.3} lineClamp={2}>
              {itinerary.description}
            </Text>
          </div>

          <Group justify='space-between' gap={5} mt={'xs'}>
            <Center>
              <Link to={`/profile/${userData?.id}`}>
                <Avatar
                  src={userData?.avatar || '/images/avatar-placeholder.svg'}
                  size={22}
                  mr='8'
                />
              </Link>
              <Link to={`/profile/${userData?.id}`}>
                <Text size='14' inline>
                  {userData?.username}
                </Text>
              </Link>
            </Center>

            <Group gap={0}>
              <LikeButton itinerary={itinerary} />
              <ActionIcon variant='subtle' color='gray' size={24} p={3}>
                <IoShareSocialSharp size={16} color='black' />
              </ActionIcon>
            </Group>
          </Group>
        </div>
      </Card>
    </div>
  )
}
