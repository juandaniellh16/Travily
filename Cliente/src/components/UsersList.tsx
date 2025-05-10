import { useAuth } from '@/hooks/useAuth'
import { UserWithFollowStatus } from '@/types'
import { Avatar, Text } from '@mantine/core'
import { Link } from 'react-router'
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
          <Link
            to={`/${user?.username}`}
            className={`overflow-hidden ${user.id !== authUser?.id ? 'w-[60%] mr-4' : 'w-[90%]'}`}
          >
            <div className='flex items-center overflow-hidden'>
              <Avatar
                src={user.avatar || '/images/placeholder/avatar-placeholder.svg'}
                mr='xs'
                className='!size-[40px] sm:!size-[45px]'
              />
              <div className='leading-none overflow-hidden'>
                <Text truncate='end' className='!mb-0.5 !font-medium !text-sm'>
                  {user.name}
                </Text>
                <Text truncate='end' className='!text-gray-500 !text-sm'>
                  @{user.username}
                </Text>
              </div>
            </div>
          </Link>
          {authUser?.id != user.id && <FollowButton user={user} handleFollow={handleFollow} />}
        </li>
      ))}
    </ul>
  )
}
