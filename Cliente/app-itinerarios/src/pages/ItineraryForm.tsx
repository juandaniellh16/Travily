import { API_BASE_URL } from '@/config/config'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button, Textarea, TextInput, Title } from '@mantine/core'
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`${API_BASE_URL}/upload-itinerary`, {
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
        const itinerary = await itineraryService.create(
          title,
          description,
          image,
          startDate,
          endDate,
          locations,
          userId
        )
        navigate(`/itinerary/${itinerary.id}`)
      }
    } catch (error) {
      setLoading(false)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    }
  }

  const placeHolderStartDate = new Date()
  const placeHolderEndDate = new Date(placeHolderStartDate)
  placeHolderEndDate.setDate(placeHolderStartDate.getDate() + 7)

  return (
    <div className='px-8 flex flex-col items-center'>
      <Title order={2} ta='center' mb='xl'>
        Crea un nuevo itinerario
      </Title>
      {error && <p className='text-center text-red-500'>{error}</p>}
      <form onSubmit={handleSubmit} className='mb-4'>
        <TextInput
          label='Título'
          placeholder='Viaje a la playa'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          withAsterisk={false}
          required
        />
        <div className='flex items-center gap-2 mt-5'>
          <TextInput
            label='Añadir destino'
            placeholder='Londres, París, Madrid...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className='w-full'
          />
          <Button onClick={handleAddLocation} className='flex-shrink-0 mt-auto'>
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
            required
          />
        </div>

        <input
          type='file'
          onChange={handleImageChange}
          accept='.png, .jpg, .jpeg'
          className='mt-5'
        />
        <Button
          type='submit'
          loading={loading}
          loaderProps={{ type: 'dots' }}
          fullWidth
          mt='lg'
          className='py-2 text-white bg-blue-500 rounded-lg'
        >
          Crear
        </Button>
      </form>
    </div>
    /*
    <div className='w-full'>
      <h1 className='text-xl font-medium text-center'>Create new itinerary</h1>
      {error && <p className='text-center text-red-500'>{error}</p>}

      <form onSubmit={handleSubmit} className='m-y-4'>
        <div className='flex gap-2'>
          <input
            type='text'
            placeholder='Añadir destino'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className='w-full px-4 py-2 border rounded-lg'
          />
          <button
            onClick={handleAddLocation}
            type='button'
            className='px-4 py-2 text-white bg-blue-500 rounded-lg'
          >
            Añadir
          </button>
        </div>
        {locations.length > 0 && (
          <label className='block mt-2 text-gray-700'>
            Destinos: {locations.join(', ')}
          </label>
        )}
        <input
          type='text'
          placeholder='Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className='w-full px-4 py-2 border rounded-lg'
          required
        />
        <input
          type='text'
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className='w-full px-4 py-2 border rounded-lg'
        />
        <input
          type='date'
          placeholder='Start date'
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className='w-full px-4 py-2 border rounded-lg'
          required
        />
        <input
          type='date'
          placeholder='End date'
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className='w-full px-4 py-2 border rounded-lg'
          required
        />
        <input
          type='file'
          onChange={handleImageChange}
          accept='.png, .jpg, .jpeg'
        />
        <Button
          type='submit'
          loading={loading}
          loaderProps={{ type: 'dots' }}
          fullWidth
          className='py-2 text-white bg-blue-500 rounded-lg'
        >
          Create
        </Button>
      </form>
    </div>*/
  )
}
