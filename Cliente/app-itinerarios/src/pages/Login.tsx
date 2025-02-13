import { useAuth } from '@/hooks/useAuth'
import {
  Button,
  Checkbox,
  Group,
  PasswordInput,
  TextInput,
  Title,
  Text
} from '@mantine/core'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export const Login = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
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
      if (onLoginSuccess) {
        onLoginSuccess?.()
      } else {
        navigate(location.state?.from?.pathname || '/')
      }
    } catch (error) {
      setLoading(false)
      if (error instanceof Error) {
        if (error.message.includes('invalid input')) {
          setError(
            'Datos de entrada no válidos. Asegúrate de que todos los campos estén correctos.'
          )
        } else if (error.message.includes('access not authorized')) {
          setError(
            'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.'
          )
        } else if (error.message.includes('resource not found')) {
          setError(
            'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.'
          )
        } else {
          setError(
            'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
          )
        }
      } else {
        setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
      }
    }
  }

  return (
    <div className='px-8'>
      <Title order={2} ta='center' mb='xl'>
        Bienvenido a Itinerarios
      </Title>
      {error && <p className='mb-4 text-center text-red-500'>{error}</p>}
      <form onSubmit={handleSubmit} className='mb-4'>
        <TextInput
          label='Usuario/Correo electrónico'
          placeholder=''
          value={username}
          size='md'
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <PasswordInput
          label='Contraseña'
          placeholder=''
          value={password}
          size='md'
          onChange={(e) => setPassword(e.target.value)}
          required
          mt='sm'
        />
        <Group justify='space-between' mt='lg'>
          <Checkbox label='Recuérdame' />
          <Link to='#' className='text-sm text-blue-500 hover:underline'>
            ¿Has olvidado la contraseña?
          </Link>
        </Group>
        <Button
          type='submit'
          loading={loading}
          loaderProps={{ type: 'dots' }}
          fullWidth
          color='teal'
          mt='xl'
        >
          Entrar
        </Button>
      </form>

      <Text size='sm' ta='center' mt='lg' mb='md'>
        ¿No tienes una cuenta?{' '}
        <Link to='/register' className='text-blue-500 hover:underline'>
          Regístrate
        </Link>
      </Text>
    </div>
  )
}
