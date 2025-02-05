import { useAuth } from '@/hooks/useAuth'
import { Avatar, Group, Text, UnstyledButton } from '@mantine/core'
import { SlArrowRight } from 'react-icons/sl'

export const ProfileButton = () => {
  const { user } = useAuth()

  return (
    <UnstyledButton className='w-full'>
      <Group
        gap={'sm'}
        className='justify-between p-1 m-2 rounded-lg hover:bg-primary-foreground'
      >
        <Avatar src={user?.avatar} radius='xl' />

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
  )
}
