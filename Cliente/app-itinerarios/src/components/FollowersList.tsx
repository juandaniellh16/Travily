import { useAuth } from '@/hooks/useAuth'
import { UserWithFollowStatus } from '@/types'
import { Avatar } from '@mantine/core'
import { Link } from 'react-router-dom'
import { FollowButton } from './FollowButton'

interface FollowersListProps {
  followers: UserWithFollowStatus[]
  handleFollow: (id: string, isFollowing: boolean) => void
}

export const FollowersList = ({
  followers,
  handleFollow
}: FollowersListProps) => {
  const { user } = useAuth()

  return (
    <ul className='w-full max-w-md mx-auto mb-14'>
      {followers.map((follower) => (
        <li
          key={follower.id}
          className='flex items-center justify-between px-1 py-4 border-b last:border-b-0'
        >
          <Link to={`/${follower?.username}`}>
            <div className='flex items-center'>
              <Avatar
                src={follower.avatar || '/images/avatar-placeholder.svg'}
                mr='xs'
                className='!size-[40px] sm:!size-[45px]'
              />
              <div className='leading-none'>
                <p className='mb-0.5 font-medium text-sm'>{follower.name}</p>
                <p className='text-sm text-gray-500'>@{follower.username}</p>
              </div>
            </div>
          </Link>
          {(!user || user?.id != follower.id) && (
            <FollowButton user={follower} handleFollow={handleFollow} />
          )}
        </li>
      ))}
    </ul>
  )
}
