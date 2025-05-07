import { Login } from '@/pages/Login'
import { Modal, ScrollArea } from '@mantine/core'

export const LoginModal = ({
  opened,
  close,
  onLoginSuccess
}: {
  opened: boolean
  close: () => void
  onLoginSuccess: () => void
}) => {
  return (
    <Modal
      opened={opened}
      onClose={close}
      size='md'
      centered
      radius='lg'
      scrollAreaComponent={ScrollArea.Autosize.withProps({
        scrollbars: false
      })}
    >
      <div className='overflow-y-auto max-h-[60vh] px-4 sm:px-8'>
        <Login onLoginSuccess={onLoginSuccess} />
      </div>
    </Modal>
  )
}
