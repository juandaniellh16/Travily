import { useAuth } from '@/hooks/useAuth'
import { UserWithFollowStatus } from '@/types'
import { Avatar } from '@mantine/core'
import { Link } from 'react-router-dom'
import { FollowButton } from './FollowButton'

interface UsersListProps {
  users: UserWithFollowStatus[]
  handleFollow: (id: string, isFollowing: boolean) => void
}

export const UsersList = ({ users, handleFollow }: UsersListProps) => {
  const { user: authUser } = useAuth()

  return (
    <ul className='w-full max-w-md mx-auto mb-14'>
      {users.map((user) => (
        <li
          key={user.id}
          className='flex items-center justify-between px-1 py-4 border-b last:border-b-0'
        >
          <Link to={`/${user?.username}`}>
            <div className='flex items-center'>
              <Avatar
                src={user.avatar || '/images/avatar-placeholder.svg'}
                mr='xs'
                className='!size-[40px] sm:!size-[45px]'
              />
              <div className='leading-none'>
                <p className='mb-0.5 font-medium text-sm'>{user.name}</p>
                <p className='text-sm text-gray-500'>@{user.username}</p>
              </div>
            </div>
          </Link>
          {authUser?.id != user.id && (
            <FollowButton user={user} handleFollow={handleFollow} />
          )}
        </li>
      ))}
    </ul>
  )
}
