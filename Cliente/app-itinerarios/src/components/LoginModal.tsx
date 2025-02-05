import { Login } from '@/pages/Login'
import { Modal } from '@mantine/core'

export const LoginModal = ({
  opened,
  close
}: {
  opened: boolean
  close: () => void
}) => {
  return (
    <Modal opened={opened} onClose={close} centered radius='lg'>
      <Login />
    </Modal>
  )
}
