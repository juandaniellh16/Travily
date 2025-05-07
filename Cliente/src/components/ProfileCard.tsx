import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import { UserPublic } from '@/types'
import { Avatar, Button, Card, Group, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { LoginModal } from './LoginModal'

interface ProfileCardProps {
  setOpened: (opened: boolean) => void
}

export const ProfileCard = ({ setOpened }: ProfileCardProps) => {
  const { username } = useParams()
  const { user: authUser, refreshUser } = useAuth()
  const navigate = useNavigate()

  const isAuthUser = !username || username === authUser?.username
  const [profileUser, setProfileUser] = useState<UserPublic | null>(isAuthUser ? authUser : null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [opened, { open, close }] = useDisclosure(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthUser && username) {
        try {
          const data = await userService.getByUsername(username)
          setProfileUser(data)

          if (authUser) {
            const followingStatus = await userService.checkIfFollowing(data.id)
            setIsFollowing(followingStatus)
          }
        } catch {
          console.error('Error fetching user data')
        }
      } else if (isAuthUser) {
        setProfileUser(authUser)
      }
    }

    fetchUserData()
  }, [username, isAuthUser, authUser])

  const handleFollow = async () => {
    if (!authUser) {
      open()
      return
    }
    if (!profileUser) return

    const previousFollowingState = isFollowing
    const previousFollowersCount = profileUser?.followers ?? 0
    try {
      if (isFollowing) {
        setIsFollowing(!isFollowing)
        setProfileUser((prev) => (prev ? { ...prev, followers: prev.followers - 1 } : prev))
        await userService.unfollowUser(profileUser.id)
      } else {
        setIsFollowing(!isFollowing)
        setProfileUser((prev) => (prev ? { ...prev, followers: prev.followers + 1 } : prev))
        await userService.followUser(profileUser.id)
      }
      await refreshUser()
    } catch {
      console.error('Error following/unfollowing user')
      setIsFollowing(previousFollowingState)
      setProfileUser((prev) => (prev ? { ...prev, followers: previousFollowersCount } : prev))
    }
  }

  return (
    <>
      <LoginModal
        opened={opened}
        close={close}
        onLoginSuccess={() => {
          close()
        }}
      />
      <Card withBorder padding='lg' radius='md'>
        <Card.Section
          h={140}
          style={{
            backgroundImage: 'url(/images/profile-header.png)'
          }}
        />
        <Avatar
          src={profileUser?.avatar || '/images/placeholder/avatar-placeholder.svg'}
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
          <button
            onClick={() => {
              if (authUser) {
                setOpened(true)
                navigate(`/${profileUser?.username}/following`, {
                  state: { fromProfile: true }
                })
              } else {
                open()
              }
            }}
          >
            <div key='Following'>
              <Text ta='center' fz='lg' fw={500}>
                {profileUser?.following}
              </Text>
              <Text ta='center' fz='sm' c='dimmed' lh={1}>
                Siguiendo
              </Text>
            </div>
          </button>
          <button
            onClick={() => {
              if (authUser) {
                setOpened(true)
                navigate(`/${profileUser?.username}/followers`, {
                  state: { fromProfile: true }
                })
              } else {
                open()
              }
            }}
          >
            <div key='Followers'>
              <Text ta='center' fz='lg' fw={500}>
                {profileUser?.followers}
              </Text>
              <Text ta='center' fz='sm' c='dimmed' lh={1}>
                Seguidores
              </Text>
            </div>
          </button>
        </Group>
        {!isAuthUser && (
          <Button
            radius='md'
            mt='lg'
            size='sm'
            w={{ base: '50%', sm: '35%' }}
            variant={isFollowing ? 'filled' : 'default'}
            color={isFollowing ? 'red' : 'blue'}
            className='mx-auto transition-all duration-200 text-nowrap'
            onClick={handleFollow}
          >
            {isFollowing ? 'Dejar de seguir' : 'Seguir'}
          </Button>
        )}
      </Card>
    </>
  )
}
