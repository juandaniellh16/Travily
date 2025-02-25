import { ActionIcon } from '@mantine/core'
import { IoMdNotificationsOutline } from 'react-icons/io'

export const NotificationBell = () => {
  return (
    <ActionIcon
      variant='subtle'
      size='lg'
      radius='md'
      aria-label='Notificaciones'
      color='gray'
    >
      <IoMdNotificationsOutline size='23' color='black' />
    </ActionIcon>
  )
}
