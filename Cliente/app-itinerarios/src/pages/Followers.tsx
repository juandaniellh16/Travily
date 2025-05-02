import { UsersList } from '@/components/UsersList'
import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import { UserWithFollowStatus } from '@/types'
import { Loader } from '@mantine/core'
import { useOutletContext } from 'react-router'

export const Followers = () => {
  const { refreshUser } = useAuth()

  const { followers, setFollowers } = useOutletContext<{
    followers: UserWithFollowStatus[] | null
    setFollowers: React.Dispatch<React.SetStateAction<UserWithFollowStatus[]>>
  }>()

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      setFollowers((prev) =>
        prev.map((f) => (f.id === userId ? { ...f, isFollowing: !isFollowing } : f))
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

  if (followers === null) {
    return (
      <div className='flex items-center justify-center w-full my-[25%]'>
        <Loader color='teal' />
      </div>
    )
  }

  return (
    <div className='flex flex-col justify-center'>
      <div className='w-full'>
        {followers.length === 0 ? (
          <p className='mt-6 text-center text-gray-500'>Aún no tiene seguidores</p>
        ) : (
          <UsersList users={followers} handleFollow={handleFollow} />
        )}
      </div>
    </div>
  )
}
