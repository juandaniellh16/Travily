import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import { UserWithFollowStatus } from '@/types'
import { Avatar, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export const RightColumn = () => {
  const { user: authUser } = useAuth()
  const [following, setFollowing] = useState<UserWithFollowStatus[] | null>(
    null
  )

  useEffect(() => {
    const fetchFollowingData = async () => {
      if (authUser) {
        try {
          const following = await userService.getFollowing(authUser.id)
          setFollowing(following)
        } catch {
          console.error('Error fetching following')
        }
      }
    }

    fetchFollowingData()
  }, [authUser])

  return (
    <>
      <div className='w-full px-4 py-2 bg-neutral-100 rounded-xl'>
        <Text ta='left' size='lg' fw={500}>
          Tus amigos
        </Text>
        <ul className='w-full'>
          {following?.map((user) => (
            <li
              key={user.id}
              className='flex items-center justify-between px-1 py-4 border-b last:border-b-0'
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
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
