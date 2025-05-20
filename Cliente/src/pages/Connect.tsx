import { UsersList } from '@/components/users/UsersList'
import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import { UserWithFollowStatus } from '@/types'
import { Loader, Title } from '@mantine/core'
import { useEffect, useState } from 'react'

export const Connect = () => {
  const { user: authUser, refreshUser } = useAuth()
  const [suggestedUsers, setSuggestedUsers] = useState<UserWithFollowStatus[] | null>(null)

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (authUser) {
        try {
          const users = await userService.getSuggestedUsers({})
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
        prev ? prev.map((f) => (f.id === userId ? { ...f, isFollowing: !isFollowing } : f)) : null
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

  if (suggestedUsers === null) {
    return (
      <div className='flex items-center justify-center w-full my-[25%]'>
        <Loader color='teal' />
      </div>
    )
  }

  return (
    <div className='flex flex-col justify-center px-8'>
      <Title order={2} ta='center' mb='xl'>
        Conecta con otros usuarios
      </Title>
      <div className='w-full'>
        {suggestedUsers.length === 0 ? (
          <p className='mt-6 text-center text-gray-500'>
            En este momento no se encuentran usuarios. Inténtalo más tarde.
          </p>
        ) : (
          <UsersList users={suggestedUsers} handleFollow={handleFollow} />
        )}
      </div>
    </div>
  )
}
