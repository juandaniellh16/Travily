import { useAuth } from '@/hooks/useAuth'
import {
  Button,
  Checkbox,
  Group,
  PasswordInput,
  TextInput,
  Text,
  Title
} from '@mantine/core'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export const Login = ({ onLoginSuccess }: { onLoginSuccess?: () => void }) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(usernameOrEmail, password)
      if (onLoginSuccess) {
        onLoginSuccess?.()
      } else {
        navigate(location.state?.from?.pathname || '/')
      }
    } catch (error) {
      setLoading(false)
      if (error instanceof Error) {
        switch (error.message) {
          case 'InvalidInputError':
            setError(
              'Datos de entrada inválidos. Asegúrate de que todos los campos estén correctos.'
            )
            break
          case 'UnauthorizedError':
            setError(
              'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.'
            )
            break
          case 'NotFoundError':
            setError(
              'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.'
            )
            break
          default:
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
    <div>
      <div className='sticky top-0 z-10 w-full pb-1 text-center bg-white'>
        <Title order={2} ta='center' mb='xl'>
          Inicia sesión en Tripify
        </Title>
      </div>
      {error && (
        <p className='max-w-xs mb-4 text-center text-red-500'>{error}</p>
      )}
      <form onSubmit={handleSubmit} className='mb-4'>
        <TextInput
          label='Usuario/Correo electrónico'
          placeholder=''
          value={usernameOrEmail}
          size='md'
          onChange={(e) => setUsernameOrEmail(e.target.value)}
          required
          withAsterisk={false}
        />
        <PasswordInput
          label='Contraseña'
          placeholder=''
          value={password}
          size='md'
          onChange={(e) => setPassword(e.target.value)}
          required
          withAsterisk={false}
          mt='sm'
        />
        <Group justify='space-between' mt='lg' wrap='nowrap'>
          <Checkbox label='Recuérdame' size='sm' />
          <Link
            to='#'
            className='text-sm leading-tight text-center text-blue-500 hover:underline'
          >
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
