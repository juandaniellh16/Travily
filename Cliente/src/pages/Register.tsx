import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import {
  Avatar,
  Button,
  FileButton,
  PasswordInput,
  TextInput,
  Title,
  Text,
  Loader
} from '@mantine/core'
import { defaultAvatars } from '@/utils'

export const Register = () => {
  const { user, register, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user])

  const handleAvatarChange = async (file: File | null) => {
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`/api/upload/avatar`, {
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
            setError('La dirección de correo electrónico ya está en uso. Por favor, elige otra.')
            break
          default:
            setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
        }
      } else {
        setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
      }
    }
  }

  if (isLoading || user) {
    return (
      <div className='flex items-center justify-center w-full h-full my-[25%]'>
        <Loader color='teal' />
      </div>
    )
  }

  return (
    <div className='flex items-center justify-center mx-auto'>
      <div className='w-full max-w-sm'>
        <Title order={2} ta='center' mb='xl'>
          Regístrate en Travily
        </Title>
        {error && <p className='max-w-xs mx-auto mb-4 text-center text-red-500'>{error}</p>}
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
          <Text size='md' fw={500} mt='sm' className='!mb-1.5'>
            Elige o sube tu avatar
          </Text>
          <div className='grid grid-cols-6 gap-2'>
            {defaultAvatars.map((url) => (
              <button
                key={url}
                type='button'
                onClick={() => setAvatar(url)}
                className={`border-2 rounded-full transition ${
                  avatar === url ? 'border-blue-500' : 'border-transparent hover:border-blue-300'
                }`}
              >
                <img src={url} alt='avatar' className='object-cover w-full h-auto rounded-md' />
              </button>
            ))}
          </div>
          <div className='relative mx-auto w-[90px] h-[90px] mt-4'>
            <FileButton onChange={handleAvatarChange} accept='.png, .jpg, .jpeg'>
              {(props) => (
                <Avatar
                  src={avatar || '/images/placeholder/avatar-placeholder.svg'}
                  w={90}
                  h={90}
                  className='transition cursor-pointer hover:opacity-80'
                  {...props}
                />
              )}
            </FileButton>
            {avatar && (
              <button
                type='button'
                onClick={() => setAvatar(null)}
                className='absolute top-[-4px] right-[-12px] bg-gray-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-gray-500'
                aria-label='Remove avatar'
              >
                ✕
              </button>
            )}
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
