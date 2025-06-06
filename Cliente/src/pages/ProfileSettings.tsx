import { API_BASE_URL } from '@/config/config'
import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'
import { defaultAvatars } from '@/utils'
import {
  Text,
  Avatar,
  Button,
  FileButton,
  PasswordInput,
  TextInput,
  Loader,
  ActionIcon
} from '@mantine/core'
import { useEffect, useState } from 'react'
import { IoIosArrowBack } from 'react-icons/io'
import { Link } from 'react-router'

export const ProfileSettings = () => {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
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

  const handleAvatarChange = (file: File | null) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setAvatar(previewUrl)
      setAvatarFile(file)
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
        let avatarUrl = avatar
        if (avatarFile) {
          const formData = new FormData()
          const fileName = `${user.username}-${Date.now()}`
          const customFile = new File([avatarFile], fileName, { type: avatarFile.type })
          formData.append('file', customFile)
          const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
            method: 'POST',
            body: formData
          })
          const data = await response.json()
          avatarUrl = data.avatarUrl
        }

        await userService.update(user.id, {
          name,
          username,
          email,
          currentPassword: currentPassword,
          newPassword: newPassword,
          avatar: avatarUrl
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
              setError('La dirección de correo electrónico ya está en uso. Por favor, elige otra.')
              break
            default:
              setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
          }
        } else {
          setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
        }
      } finally {
        setLoading(false)
      }
    }
  }

  if (!user) {
    return (
      <div className='flex items-center justify-center w-full h-full my-[25%]'>
        <Loader color='brand' />
      </div>
    )
  }

  return (
    <>
      <div className='grid items-center grid-cols-8 gap-3 py-1.5 xxs:py-1 px-1 xxs:px-1.5 rounded-t-lg bg-[#12b886] mb-8'>
        <Link to={`/${user.username}`} className='flex items-center col-span-1'>
          {window.innerWidth > 480 ? (
            <ActionIcon
              variant='subtle'
              color='white'
              size={30}
              radius='xl'
              aria-label='Back to profile'
              className='pt-1'
            >
              <IoIosArrowBack size={22} strokeWidth={3} className='text-gray-50' />
            </ActionIcon>
          ) : (
            <button>
              <IoIosArrowBack
                size={22}
                strokeWidth={3}
                className='text-gray-50 hover:text-brand-300 pt-0.5'
              />
            </button>
          )}
        </Link>
        <div className='col-span-6 text-center text-nowrap'>
          <h2 className='text-lg font-semibold leading-none text-white xs:text-xl'>
            Configuración del perfil
          </h2>
        </div>
        <div className='col-span-1'></div>
      </div>
      <div className='flex items-center justify-center'>
        <div className='w-full max-w-sm'>
          {error && <p className='max-w-xs mx-auto mb-4 text-center text-red-500'>{error}</p>}
          {success && <p className='max-w-xs mx-auto mb-4 text-center text-brand-500'>{success}</p>}
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
            <Text size='md' fw={500} mt='sm' className='!mb-1.5'>
              Cambia tu avatar
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
              color='brand'
              mt='lg'
            >
              Guardar cambios
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
