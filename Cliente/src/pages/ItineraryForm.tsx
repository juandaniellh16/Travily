import { API_BASE_URL } from '@/config/config'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, Button, FileButton, Switch, Textarea, TextInput, Title } from '@mantine/core'
import { itineraryService } from '@/services/itineraryService'
import { LuCalendarDays } from 'react-icons/lu'
import { DatePickerInput } from '@mantine/dates'
import '@mantine/dates/styles.css'
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md'
import { LocationCombobox } from '@/components/LocationCombobox'
import { LocationSuggestion, LocationType } from '@/types'
import { getSpanishName } from '@/utils'

export const ItineraryForm = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [datesError, setDatesError] = useState(false)
  const [location, setLocation] = useState<LocationType | null>(null)
  const [locationError, setLocationError] = useState(false)
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

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setStartDate(date.toISOString())
    } else {
      setStartDate('')
    }
  }

  const handleEndDateChange = (date: Date | null) => {
    if (date) {
      setEndDate(date.toISOString())
    } else {
      setEndDate('')
    }
  }

  const handleLocationSelect = (selectedLocation: LocationSuggestion | null) => {
    if (!selectedLocation) {
      setLocation(null)
    } else {
      // eslint-disable-next-line
      const { type, name, alternateNames, ...rest } = selectedLocation

      let finalName = name

      if (alternateNames) {
        const nameInSpanish = getSpanishName(alternateNames)
        if (nameInSpanish) {
          finalName = nameInSpanish
        }
      }

      setLocation({
        ...rest,
        name: finalName
      } as LocationType)

      setLocationError(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (startDate > endDate) {
      setDatesError(true)
      setLoading(false)
      return
    }
    setDatesError(false)
    if (!location) {
      setLocationError(true)
      setLoading(false)
      return
    }

    try {
      if (user) {
        const userId = user.id

        let imageUrl = image
        if (imageFile) {
          const formData = new FormData()
          const fileName = `${user.username}-${Date.now()}.${imageFile.name.split('.').pop()}`
          const customFile = new File([imageFile], fileName, { type: imageFile.type })
          formData.append('file', customFile)
          const response = await fetch(`${API_BASE_URL}/upload/itinerary-image`, {
            method: 'POST',
            body: formData
          })
          const data = await response.json()
          imageUrl = data.imageUrl
        }

        const relativePath = await itineraryService.create(
          title,
          description,
          imageUrl,
          startDate,
          endDate,
          location,
          isPublic,
          userId
        )
        navigate(relativePath, {
          state: { created: true }
        })
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
          setError('Ocurrió un error inesperado. Por favor, inténtalo de nuevo.')
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
    <div className='flex items-center justify-center'>
      <div className='w-full max-w-md px-8'>
        <Title order={2} ta='center' mb='xl'>
          Crea un nuevo itinerario
        </Title>
        {error && <p className='mb-4 text-center text-red-500'>{error}</p>}
        <form onSubmit={handleSubmit} className='mb-4'>
          <TextInput
            label='Título'
            placeholder='Viaje a Escocia'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size='md'
            mb='sm'
            withAsterisk={false}
            required
          />
          <LocationCombobox onLocationSelect={handleLocationSelect} />
          {locationError && (
            <p className='mt-0.5 text-red-500 text-sm'>Por favor, selecciona un destino.</p>
          )}
          <Textarea
            label='Descripción (opcional)'
            placeholder='Un viaje inolvidable a Escocia...'
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
              placeholder={placeHolderStartDate.toLocaleDateString('es-ES').replace(/\//g, '-')}
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
              placeholder={placeHolderEndDate.toLocaleDateString('es-ES').replace(/\//g, '-')}
              value={endDate ? new Date(endDate) : null}
              onChange={handleEndDateChange}
              className='w-full'
              size='md'
              required
            />
          </div>
          {datesError && (
            <p className='mt-0.5 text-red-500 text-sm'>
              La fecha de inicio no puede ser posterior a la fecha de fin.
            </p>
          )}
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
            label={isPublic ? 'Público' : 'Privado'}
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
