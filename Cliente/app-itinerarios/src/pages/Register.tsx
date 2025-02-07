import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  Avatar,
  Button,
  FileButton,
  PasswordInput,
  TextInput,
  Title
} from '@mantine/core'

const API_URL = 'http://localhost:3000'

export const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAvatarChange = async (file: File | null) => {
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_URL}/upload-avatar`, {
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
    } else {
      setAvatar(null)
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
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  return (
    <div className='px-8'>
      <Title order={2} ta='center' mb='xl'>
        Bienvenido a Itinerarios
      </Title>
      {error && <p className='text-center text-red-500'>{error}</p>}
      <form onSubmit={handleSubmit} className='mb-4'>
        <TextInput
          label='Nombre'
          placeholder=''
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <TextInput
          label='Nombre de usuario'
          placeholder=''
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          mt='sm'
        />
        <TextInput
          type='email'
          label='Correo electrónico'
          placeholder=''
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          mt='sm'
        />
        <PasswordInput
          label='Contraseña'
          placeholder=''
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          mt='sm'
        />
        <div className='flex justify-center mt-4'>
          <FileButton onChange={handleAvatarChange} accept='.png, .jpg, .jpeg'>
            {(props) => (
              <Avatar
                src={avatar}
                size={100}
                radius={90}
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
          mt='lg'
        >
          Crear cuenta
        </Button>
      </form>
    </div>
  )
}
