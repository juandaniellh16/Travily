import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import { User } from '@/types'
import { Avatar, Button, Card, Group, Text } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export const ProfileCard = () => {
  const { userId } = useParams()
  const { user: authUser } = useAuth()

  const isAuthUser = !userId || userId === authUser?.id
  const [profileUser, setProfileUser] = useState<User | null>(
    isAuthUser ? authUser : null
  )

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthUser && userId) {
        try {
          const data = await userService.getUserData(userId)
          setProfileUser(data)
        } catch {
          console.error('Error fetching user data')
        }
      } else if (isAuthUser) {
        setProfileUser(authUser)
      }
    }

    fetchUserData()
  }, [userId, isAuthUser, authUser])

  return (
    <Card withBorder padding='lg' radius='md'>
      <Card.Section
        h={140}
        style={{
          backgroundImage: 'url(/images/profile-header.png)'
        }}
      />
      <Avatar
        src={profileUser?.avatar || '/images/avatar-placeholder.svg'}
        size={80}
        mx='auto'
        mt={-30}
        bg={'white'}
        className='border-4 border-white'
      />
      <Text ta='center' fz='lg' fw={500} mt='sm'>
        {profileUser?.name ?? ''}
      </Text>
      <Text ta='center' fz='sm' c='dimmed'>
        {profileUser?.username ? `@${profileUser.username}` : ''}
      </Text>
      <Group mt='sm' justify='center' gap={30}>
        <div key='Following'>
          <Text ta='center' fz='lg' fw={500}>
            {profileUser?.following}
          </Text>
          <Text ta='center' fz='sm' c='dimmed' lh={1}>
            Following
          </Text>
        </div>
        <div key='Followers'>
          <Text ta='center' fz='lg' fw={500}>
            {profileUser?.followers}
          </Text>
          <Text ta='center' fz='sm' c='dimmed' lh={1}>
            Followers
          </Text>
        </div>
      </Group>
      {!isAuthUser && (
        <Button
          radius='md'
          mt='md'
          size='md'
          w={'40%'}
          variant='default'
          className='mx-auto'
        >
          Follow
        </Button>
      )}
    </Card>
  )
}
