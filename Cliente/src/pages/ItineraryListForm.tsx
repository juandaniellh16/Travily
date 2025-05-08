import { API_BASE_URL } from '@/config/config'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Button, FileButton, Switch, Textarea, TextInput, Title } from '@mantine/core'
import '@mantine/dates/styles.css'
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md'
import { itineraryListService } from '@/services/itineraryListService'

export const ItineraryListForm = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isPublic, setIsPublic] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleImageChange = (file: File | null) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setImage(previewUrl)
      setImageFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (user) {
        const userId = user.id

        let imageUrl = image
        if (imageFile) {
          const formData = new FormData()
          const fileName = `${user.username}-${Date.now()}.${imageFile.name.split('.').pop()}`
          const customFile = new File([imageFile], fileName, { type: imageFile.type })
          formData.append('file', customFile)
          const response = await fetch(`${API_BASE_URL}/upload/list-image`, {
            method: 'POST',
            body: formData
          })
          const data = await response.json()
          imageUrl = data.imageUrl
        }

        const relativePath = await itineraryListService.create(
          title,
          description,
          imageUrl,
          isPublic,
          userId
        )
        navigate(relativePath)
      }
    } catch (error) {
      setLoading(false)
      if (error instanceof Error) {
        if (error.message.includes('invalid input')) {
          setError(
            'Datos de entrada no válidos. Asegúrate de que todos los campos estén correctos.'
          )
        } else if (error.message.includes('access not authorized')) {
          setError('Por favor, inicia sesión para poder crear una lista.')
        } else {
          setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
        }
      } else {
        setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
      }
    }
  }

  return (
    <div className='flex items-center justify-center'>
      <div className='w-full max-w-md px-8'>
        <Title order={2} ta='center' mb='xl'>
          Crea una nueva lista
        </Title>
        {error && <p className='mb-4 text-center text-red-500'>{error}</p>}
        <form onSubmit={handleSubmit} className='mb-4'>
          <TextInput
            label='Título'
            placeholder='Inspiración para el viaje a Escocia'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size='md'
            withAsterisk={false}
            required
          />
          <Textarea
            label='Descripción (opcional)'
            placeholder='Itinerarios de referencia para el viaje a Escocia...'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size='md'
            mt='sm'
          />
          <div className='relative mx-auto w-[130px] h-[90px] mt-5'>
            <FileButton onChange={handleImageChange} accept='.png, .jpg, .jpeg'>
              {(props) => (
                <Avatar
                  src={image || '/images/placeholder/landscape-placeholder.svg'}
                  w={130}
                  h={90}
                  radius='md'
                  className='transition cursor-pointer hover:opacity-80'
                  {...props}
                />
              )}
            </FileButton>
            {image && (
              <button
                type='button'
                onClick={() => setImage(null)}
                className='absolute top-[-8px] right-[-8px] bg-gray-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-gray-500'
                aria-label='Remove image'
              >
                ✕
              </button>
            )}
          </div>
          <Switch
            size='lg'
            color='teal'
            onLabel={<MdOutlineVisibility size={21} />}
            offLabel={<MdOutlineVisibilityOff size={21} />}
            label={isPublic ? 'Pública' : 'Privada'}
            checked={isPublic}
            onChange={(event) => setIsPublic(event.currentTarget.checked)}
            mt='lg'
            className='flex justify-center text-gray-500'
          />
          <Button
            type='submit'
            loading={loading}
            loaderProps={{ type: 'dots' }}
            fullWidth
            mt='lg'
            color='teal'
            className='py-2 rounded-lg'
          >
            Crear
          </Button>
        </form>
      </div>
    </div>
  )
}
