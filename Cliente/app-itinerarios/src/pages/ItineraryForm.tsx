import { API_BASE_URL } from '@/config/config'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  Avatar,
  Button,
  FileButton,
  Textarea,
  TextInput,
  Title
} from '@mantine/core'
import { itineraryService } from '@/services/itineraryService'
import { LuCalendarDays } from 'react-icons/lu'
import { DatePickerInput } from '@mantine/dates'
import '@mantine/dates/styles.css'

export const ItineraryForm = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [locations, setLocations] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleImageChange = async (file: File | null) => {
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_BASE_URL}/upload/itinerary-image`, {
          method: 'POST',
          body: formData
        })

        const data = await response.json()
        if (data.itineraryImageUrl) {
          setImage(data.itineraryImageUrl)
        }
      } catch {
        setError('Failed to upload image')
      }
    } else {
      setImage(null)
    }
  }

  const handleAddLocation = () => {
    if (inputValue.trim() !== '') {
      setLocations([...locations, inputValue.trim()])
      setInputValue('')
    }
  }

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date.toISOString().split('T')[0])
    } else {
      setStartDate('')
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date.toISOString().split('T')[0])
    } else {
      setEndDate('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (user) {
        const userId = user.id
        const relativePath = await itineraryService.create(
          title,
          description,
          image,
          startDate,
          endDate,
          locations,
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
          setError('Por favor, inicia sesión para poder crear un itinerario.')
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

  const placeHolderStartDate = new Date()
  const placeHolderEndDate = new Date(placeHolderStartDate)
  placeHolderEndDate.setDate(placeHolderStartDate.getDate() + 7)

  return (
    <div className='flex flex-col items-center px-8'>
      <Title order={2} ta='center' mb='xl'>
        Crea un nuevo itinerario
      </Title>
      {error && <p className='mb-4 text-center text-red-500'>{error}</p>}
      <form onSubmit={handleSubmit} className='mb-4'>
        <TextInput
          label='Título'
          placeholder='Viaje a la playa'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          size='md'
          withAsterisk={false}
          required
        />
        <div className='flex items-center gap-2 mt-5'>
          <TextInput
            label='Añadir destino'
            placeholder='Londres, París, Madrid...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            size='md'
            className='w-full'
          />
          <Button
            onClick={handleAddLocation}
            className='flex-shrink-0 mt-auto'
            color='teal'
            size='md'
          >
            Añadir
          </Button>
        </div>
        {locations.length > 0 && (
          <label className='block mt-2 text-sm'>
            Destinos: {locations.join(', ')}
          </label>
        )}
        <Textarea
          label='Descripción (opcional)'
          placeholder='Un viaje inolvidable a la playa'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          size='md'
          mt='sm'
        />
        <div className='flex items-center flex-grow gap-4 mt-5'>
          <DatePickerInput
            valueFormat='DD-MM-YYYY'
            leftSection={<LuCalendarDays size={18} strokeWidth={1.5} />}
            leftSectionPointerEvents='none'
            withAsterisk={false}
            label='Fecha de inicio'
            placeholder={placeHolderStartDate
              .toLocaleDateString('es-ES')
              .replace(/\//g, '-')}
            value={startDate ? new Date(startDate) : null}
            onChange={handleStartDateChange}
            className='w-full'
            size='md'
            required
          />
          <DatePickerInput
            valueFormat='DD-MM-YYYY'
            leftSection={<LuCalendarDays size={18} strokeWidth={1.5} />}
            leftSectionPointerEvents='none'
            withAsterisk={false}
            label='Fecha de fin'
            placeholder={placeHolderEndDate
              .toLocaleDateString('es-ES')
              .replace(/\//g, '-')}
            value={endDate ? new Date(endDate) : null}
            onChange={handleEndDateChange}
            className='w-full'
            size='md'
            required
          />
        </div>
        <div className='flex justify-center mt-5'>
          <FileButton onChange={handleImageChange} accept='.png, .jpg, .jpeg'>
            {(props) => (
              <Avatar
                src={image || '/images/landscape-placeholder.svg'}
                w={130}
                h={90}
                radius='md'
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
          color='teal'
          className='py-2 rounded-lg'
        >
          Crear
        </Button>
      </form>
    </div>
  )
}
