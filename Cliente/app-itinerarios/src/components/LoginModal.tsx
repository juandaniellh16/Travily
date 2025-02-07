import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Anchor, Modal, Text } from '@mantine/core'
import { useState } from 'react'

export const LoginModal = ({
  opened,
  close
}: {
  opened: boolean
  close: () => void
}) => {
  const [isRegistering, setIsRegistering] = useState(false)

  return (
    <Modal opened={opened} onClose={close} size='md' centered radius='lg'>
      {isRegistering ? <Register /> : <Login />}

      <Text size='sm' ta='center' mt='lg' mb='md'>
        {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}{' '}
        <Anchor
          component='button'
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Inicia sesión' : 'Regístrate'}
        </Anchor>
      </Text>
    </Modal>
  )
}
