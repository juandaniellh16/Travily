import { UsersList } from '@/components/UsersList'
import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import { UserWithFollowStatus } from '@/types'
import { Loader } from '@mantine/core'
import { useOutletContext } from 'react-router-dom'

export const Following = () => {
  const { refreshUser } = useAuth()

  const { following, setFollowing } = useOutletContext<{
    following: UserWithFollowStatus[] | null
    setFollowing: React.Dispatch<React.SetStateAction<UserWithFollowStatus[]>>
  }>()

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await userService.unfollowUser(userId)
      } else {
        await userService.followUser(userId)
      }
      setFollowing((prev) =>
        prev.map((f) =>
          f.id === userId ? { ...f, isFollowing: !isFollowing } : f
        )
      )
      await refreshUser()
    } catch {
      console.error('Error updating follow status')
    }
  }

  if (following === null) {
    return (
      <div className='flex items-center justify-center w-full my-[25%]'>
        <Loader color='teal' />
      </div>
    )
  }

  return (
    <div className='flex flex-col justify-center'>
      <div className='w-full'>
        {following.length === 0 ? (
          <p className='mt-6 text-center text-gray-500'>Aún no sigue a nadie</p>
        ) : (
          <UsersList users={following} handleFollow={handleFollow} />
        )}
      </div>
    </div>
  )
}
