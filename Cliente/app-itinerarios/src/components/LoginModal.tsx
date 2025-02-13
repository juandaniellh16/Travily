import { Login } from '@/pages/Login'
import { Modal } from '@mantine/core'

export const LoginModal = ({
  opened,
  close,
  onLoginSuccess
}: {
  opened: boolean
  close: () => void
  onLoginSuccess?: () => void
}) => {
  return (
    <Modal opened={opened} onClose={close} size='md' yOffset='14vh' radius='lg'>
      <Login onLoginSuccess={onLoginSuccess} />
    </Modal>
  )
}
