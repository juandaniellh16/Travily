import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import { UserWithFollowStatus } from '@/types'
import { ActionIcon, Avatar, Loader, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { BiSolidUserPlus, BiSolidUserX } from 'react-icons/bi'
import { Link } from 'react-router-dom'

export const RightColumn = () => {
  const { user: authUser, refreshUser } = useAuth()
  const [suggestedUsers, setSuggestedUsers] = useState<
    UserWithFollowStatus[] | null
  >(null)

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (authUser) {
        try {
          const users = await userService.getSuggestedUsers({ limit: 3 })
          setSuggestedUsers(users)
        } catch {
          console.error('Error fetching suggested users')
        }
      }
    }

    fetchSuggestedUsers()
  }, [authUser])

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      setSuggestedUsers((prev) =>
        prev
          ? prev.map((f) =>
              f.id === userId ? { ...f, isFollowing: !isFollowing } : f
            )
          : null
      )
      if (isFollowing) {
        await userService.unfollowUser(userId)
      } else {
        await userService.followUser(userId)
      }
      await refreshUser()
    } catch {
      console.error('Error updating follow status')
    }
  }

  return (
    <div className='w-full px-3.5 py-2'>
      <Text ta='left' size='lg' fw={500}>
        A quién seguir
      </Text>
      <ul className='w-full'>
        {suggestedUsers === null ? (
          <div className='flex items-center justify-center my-3'>
            <Loader color='teal' size='sm' />
          </div>
        ) : suggestedUsers?.length === 0 ? (
          <p className='my-3 text-sm text-center text-gray-500'>
            No hay sugerencias
          </p>
        ) : (
          suggestedUsers?.map((user) => (
            <li
              key={user.id}
              className='flex items-center justify-between gap-1 py-4 border-b last:border-b-0'
            >
              <Link to={`/${user?.username}`}>
                <div className='flex items-center'>
                  <Avatar
                    src={user.avatar || '/images/avatar-placeholder.svg'}
                    mr='xs'
                    size={32}
                  />
                  <div className='leading-none text-left'>
                    <p className='mb-0.5 font-medium text-xs'>{user.name}</p>
                    <p className='text-xs text-gray-500'>@{user.username}</p>
                  </div>
                </div>
              </Link>
              <ActionIcon
                variant='subtle'
                radius='xl'
                size='md'
                color={user.isFollowing ? 'red' : 'teal'}
                onClick={() => handleFollow(user.id, user.isFollowing)}
              >
                {user.isFollowing ? (
                  <BiSolidUserX size={22} />
                ) : (
                  <BiSolidUserPlus size={22} />
                )}
              </ActionIcon>
            </li>
          ))
        )}
      </ul>
      {suggestedUsers?.length != 0 && (
        <Link to='/connect' className='flex text-sm text-blue-500'>
          Mostrar más
        </Link>
      )}
    </div>
  )
}
