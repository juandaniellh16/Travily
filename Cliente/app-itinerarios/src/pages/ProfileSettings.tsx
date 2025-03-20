import { API_BASE_URL } from '@/config/config'
import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import {
  Text,
  Avatar,
  Button,
  FileButton,
  PasswordInput,
  TextInput,
  Title
} from '@mantine/core'
import { useEffect, useState } from 'react'

export const ProfileSettings = () => {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchUserPrivateData = async () => {
      if (user) {
        try {
          const userData = await userService.getById(user.id, true)
          setName(userData.name)
          setUsername(userData.username)
          setEmail(userData.email)
          setAvatar(userData.avatar)
        } catch {
          setError('Error fetching user data')
        }
      }
    }

    fetchUserPrivateData()
  }, [user])

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
    setSuccess('')
    setLoading(true)

    if (user) {
      if (newPassword !== confirmPassword) {
        setLoading(false)
        setError('La nueva contraseña y la confirmación no coinciden.')
        return
      }
      try {
        await userService.update(user.id, {
          name,
          username,
          email,
          currentPassword: currentPassword,
          newPassword: newPassword,
          avatar
        })
        setSuccess('Cambios guardados correctamente.')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        await refreshUser()
      } catch (error) {
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
          setError(
            'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'
          )
        }
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className='flex items-center justify-center'>
      <div className='w-full max-w-md px-8'>
        <Title order={2} ta='center' mb='xl'>
          Configuración del perfil
        </Title>
        {error && (
          <p className='max-w-xs mx-auto mb-4 text-center text-red-500'>
            {error}
          </p>
        )}
        {success && (
          <p className='max-w-xs mx-auto mb-4 text-center text-emerald-500'>
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit} className='mb-4'>
          <TextInput
            placeholder='Nombre'
            label='Nombre'
            value={name}
            onChange={(e) => setName(e.target.value)}
            size='md'
          />
          <TextInput
            placeholder='Nombre de usuario'
            label='Nombre de usuario'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size='md'
            mt='sm'
          />
          <TextInput
            type='email'
            placeholder='Correo electrónico'
            label='Correo electrónico'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size='md'
            mt='sm'
          />
          <Text fw={500} mt='sm'>
            Cambia tu contraseña
          </Text>
          <PasswordInput
            placeholder='Contraseña actual'
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            size='md'
          />
          <PasswordInput
            placeholder='Nueva contraseña'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            size='md'
            mt='sm'
          />
          <PasswordInput
            placeholder='Confirmar nueva contraseña'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            size='md'
            mt='sm'
          />
          <div className='flex justify-center mt-4'>
            <FileButton
              onChange={handleAvatarChange}
              accept='.png, .jpg, .jpeg'
            >
              {(props) => (
                <Avatar
                  src={avatar || '/images/avatar-placeholder.svg'}
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
            Guardar cambios
          </Button>
        </form>
      </div>
    </div>
  )
}
