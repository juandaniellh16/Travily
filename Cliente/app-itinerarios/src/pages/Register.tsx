import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  Avatar,
  Button,
  FileButton,
  PasswordInput,
  TextInput,
  Title,
  Text
} from '@mantine/core'
import { API_BASE_URL } from '@/config/config'
import { getRandomAvatar } from '@/utils'

export const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState<string>(getRandomAvatar())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAvatarChange = async (file: File | null) => {
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        if (data.avatarUrl) {
          setAvatar(data.avatarUrl)
        }
      } catch {
        setError('Failed to upload avatar')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(name, username, email, password, avatar)
      navigate(location.state?.from?.pathname || '/')
    } catch (error) {
      setLoading(false)
      if (error instanceof Error) {
        switch (error.message) {
          case 'InvalidInputError':
            setError(
              'Datos de entrada inválidos. Asegúrate de que todos los campos estén correctos.'
            )
            break
          case 'UsernameConflictError':
            setError('El nombre de usuario ya existe. Por favor, elige otro.')
            break
          case 'EmailConflictError':
            setError(
              'La dirección de correo electrónico ya está en uso. Por favor, elige otra.'
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
    <div className='flex items-center justify-center mx-auto'>
      <div className='w-full max-w-md'>
        <Title order={2} ta='center' mb='xl'>
          Regístrate en Tripify
        </Title>
        {error && (
          <p className='max-w-xs mx-auto mb-4 text-center text-red-500'>
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className='mb-4'>
          <TextInput
            label='Nombre'
            placeholder=''
            value={name}
            onChange={(e) => setName(e.target.value)}
            size='md'
            required
          />
          <TextInput
            label='Nombre de usuario'
            placeholder=''
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size='md'
            required
            mt='sm'
          />
          <TextInput
            type='email'
            label='Correo electrónico'
            placeholder=''
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size='md'
            required
            mt='sm'
          />
          <PasswordInput
            label='Contraseña'
            placeholder=''
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size='md'
            required
            mt='sm'
          />
          <div className='flex justify-center mt-4'>
            <FileButton
              onChange={handleAvatarChange}
              accept='.png, .jpg, .jpeg'
            >
              {(props) => (
                <Avatar
                  src={avatar}
                  size={100}
                  className='transition cursor-pointer hover:opacity-80'
                  {...props}
                />
              )}
            </FileButton>
          </div>
          <Button
            type='submit'
            loading={loading}
            loaderProps={{ type: 'dots' }}
            fullWidth
            color='teal'
            mt='lg'
          >
            Crear cuenta
          </Button>
        </form>
        <Text size='sm' ta='center' mt='lg' mb='md'>
          ¿Ya tienes una cuenta?{' '}
          <Link to='/login' className='text-blue-500 hover:underline'>
            Inicia sesión
          </Link>
        </Text>
      </div>
    </div>
  )
}
