import { Image, Text, Group, Center, Avatar, ActionIcon, Menu, Switch } from '@mantine/core'
import { LikeButton } from './LikeButton'
import { ItineraryListType, UserPublic } from '@/types'
import { userService } from '@/services/userService'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { IoTrashOutline } from 'react-icons/io5'
import { useAuth } from '@/hooks/useAuth'
import { HiOutlineDotsVertical } from 'react-icons/hi'
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md'
import { ShareButton } from '../ui/ShareButton'
import { itineraryListService } from '@/services/itineraryListService'

interface ItineraryListCardProps {
  list: ItineraryListType
  handleDelete?: (id: string) => void
}

export const ItineraryListCard = ({ list, handleDelete }: ItineraryListCardProps) => {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserPublic | null>(null)

  const [isPublic, setIsPublic] = useState(list.isPublic)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userService.getById(list.userId)
        setUserData(data)
      } catch {
        console.error('Error fetching user data')
      }
    }

    fetchUserData()
  }, [list])

  const handleVisibilityChange = async () => {
    try {
      const newVisibility = !isPublic
      setIsPublic(newVisibility)
      await itineraryListService.update(list.id, {
        isPublic: newVisibility
      })
    } catch {
      console.error('Error changing itinerary list visibility')
    }
  }

  return (
    <div className='relative'>
      <Link to={`/lists/${list.id}`} className='block group'>
        <div className='flex flex-row overflow-hidden h-[121px] sm:h-[136px] rounded-lg shadow-sm bg-neutral-100'>
          <div className='w-[30%] overflow-hidden'>
            <Image
              src={list.image || '/images/placeholder/landscape-placeholder.svg'}
              alt={list.title}
              className='object-cover w-full h-full'
            />
          </div>

          <div className='flex flex-col justify-between w-[70%] px-3 sm:px-5 py-2.5 gap-2'>
            <span>
              <div
                className={`flex items-center justify-between mb-1.5 w-full ${list.userId === user?.id ? 'pr-10' : ''}`}
              >
                <Text
                  fw={500}
                  lineClamp={1}
                  lh={1.3}
                  className='!text-[14.5px] sm:!text-[16px] !mb-1.5'
                >
                  {list.title}
                </Text>
              </div>
              <Text fz='sm' c='dimmed' lh={1.3} className='!line-clamp-1 sm:!line-clamp-2'>
                {list.description}
              </Text>
            </span>

            <div className='flex items-center justify-between w-full'>
              <div className='flex items-center w-[67%] overflow-hidden'>
                <Center className='overflow-hidden'>
                  <Link to={`/${userData?.username}`} onClick={(e) => e.stopPropagation()}>
                    <Avatar
                      src={userData?.avatar || '/images/placeholder/avatar-placeholder.svg'}
                      mr='xs'
                      size={32}
                    />
                  </Link>
                  <div className='overflow-hidden leading-none'>
                    <Link to={`/${userData?.username}`} onClick={(e) => e.stopPropagation()}>
                      <Text truncate='end' className='!text-xs !font-medium'>
                        {userData?.name}
                      </Text>
                      <Text truncate='end' className='!text-xs !text-gray-500'>
                        @{userData?.username}
                      </Text>
                    </Link>
                  </div>
                </Center>
              </div>
              <Group gap={0}>
                <LikeButton itineraryList={list} />
                <ShareButton url={`${window.location.origin}/lists/${list.id}`} />
              </Group>
            </div>
          </div>
        </div>
      </Link>
      {list?.userId === user?.id && (
        <div className='absolute right-3 top-2 sm:right-5 sm:top-[9px] z-10'>
          <Menu position='bottom-end' withArrow shadow='md' width={210}>
            <Menu.Target>
              <ActionIcon
                variant='filled'
                radius='xl'
                size={26}
                aria-label='Opciones'
                color='brand'
                className='self-start'
              >
                <HiOutlineDotsVertical size={20} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                color='red'
                leftSection={<IoTrashOutline size={14} />}
                onClick={() => handleDelete?.(list.id)}
              >
                Borrar lista
              </Menu.Item>

              <Menu.Divider />

              <Switch
                size='sm'
                color='brand'
                onLabel={<MdOutlineVisibility size={18} />}
                offLabel={<MdOutlineVisibilityOff size={18} />}
                label={isPublic ? 'Pública' : 'Privada'}
                checked={isPublic}
                onChange={handleVisibilityChange}
                className='flex justify-center mt-3.5 mb-2 text-gray-500'
              />
            </Menu.Dropdown>
          </Menu>
        </div>
      )}
    </div>
  )
}
