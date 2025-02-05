import { useAuth } from '@/hooks/useAuth'
import {
  Anchor,
  Button,
  Checkbox,
  Group,
  PasswordInput,
  TextInput,
  Title,
  Text
} from '@mantine/core'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate(location.state?.from?.pathname || '/')
    } catch (error) {
      setLoading(false)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  return (
    <div className='px-4 pb-6'>
      <Title order={2} ta='center' mb='xl'>
        Bienvenido a Itinerarios
      </Title>
      {error && <p className='text-center text-red-500'>{error}</p>}
      <form onSubmit={handleSubmit} className='m-y-4'>
        <TextInput
          label='Usuario/Correo electrónico'
          placeholder=''
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <PasswordInput
          label='Contraseña'
          placeholder=''
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          mt='md'
        />
        <Group justify='space-between' mt='lg'>
          <Checkbox label='Recuérdame' />
          <Anchor component='a' size='sm'>
            ¿Has olvidado la contraseña?
          </Anchor>
        </Group>
        <Button
          type='submit'
          loading={loading}
          loaderProps={{ type: 'dots' }}
          fullWidth
          mt='xl'
        >
          Entrar
        </Button>
      </form>

      <Text size='sm' ta='center' mt='md'>
        ¿No tienes una cuenta?{' '}
        <Anchor<'a'>
          href='#'
          fw={500}
          onClick={(event) => event.preventDefault()}
        >
          Regístrate
        </Anchor>
      </Text>
    </div>
  )
}
