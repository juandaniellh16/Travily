import { useAuth } from '@/hooks/useAuth'
import { Avatar, Group, Text, UnstyledButton } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { SlArrowRight } from 'react-icons/sl'
import { useNavigate } from 'react-router-dom'
import { LoginModal } from './LoginModal'

export const ProfileButton = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [opened, { open, close }] = useDisclosure(false)

  const handleClick = () => {
    if (!user) {
      open()
    } else {
      navigate(`/${user.username}`)
    }
  }

  return (
    <>
      <LoginModal
        opened={opened}
        close={close}
        onLoginSuccess={() => {
          close()
          navigate(`/${user?.username}`)
        }}
      />
      <UnstyledButton className='w-full' onClick={handleClick}>
        <Group
          gap={'sm'}
          wrap='nowrap'
          className='justify-between p-1 m-2 rounded-lg hover:bg-primary-foreground'
        >
          <Avatar src={user?.avatar || '/images/avatar-placeholder.svg'} />

          <div className='flex-1'>
            <Text size='sm' fw={500}>
              {user?.name ?? 'Anónimo'}
            </Text>

            <Text c='dimmed' size='xs'>
              {user?.username ? `@${user.username}` : '@'}
            </Text>
          </div>

          <SlArrowRight size={8} strokeWidth={1.5} className='mr-1' />
        </Group>
      </UnstyledButton>
    </>
  )
}
