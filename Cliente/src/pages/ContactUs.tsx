import { useState } from 'react'
import { Button, TextInput, Textarea, Title } from '@mantine/core'
import { Link } from 'react-router'

export const ContactUs = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [messageSent, setMessageSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      setTimeout(() => {
        setMessageSent(true)
      }, 2000)
    } catch {
      setLoading(false)
      setError('Ocurrió un error al enviar tu mensaje. Por favor, inténtalo de nuevo.')
    }
  }

  return (
    <div className='flex items-center justify-center'>
      {messageSent ? (
        <div className='max-w-lg text-center'>
          <p className='text-xl font-bold tracking-tight text-gray-900 md:text-2xl'>
            Gracias por tu mensaje.
          </p>
          <p className='text-xl font-bold tracking-tight text-gray-900 md:text-2xl'>
            Nos pondremos en contacto contigo pronto.
          </p>
          <Link
            to='/'
            className='inline-flex px-6 py-3 mt-8 font-semibold text-center text-white transition-all duration-200 rounded-lg bg-emerald-500 hover:bg-emerald-600'
          >
            Volver al inicio
          </Link>
        </div>
      ) : (
        <div className='w-full max-w-md'>
          <Title order={2} ta='center' mb='xl'>
            Contacta con nosotros
          </Title>

          {error && <p className='max-w-xs mx-auto mb-4 text-center text-red-500'>{error}</p>}

          <form onSubmit={handleSubmit} className='mb-4'>
            <TextInput
              label='Nombre'
              value={name}
              size='md'
              onChange={(e) => setName(e.target.value)}
              required
              withAsterisk={false}
            />

            <TextInput
              label='Correo electrónico'
              value={email}
              size='md'
              onChange={(e) => setEmail(e.target.value)}
              required
              withAsterisk={false}
              mt='sm'
            />

            <Textarea
              label='Mensaje'
              value={message}
              size='md'
              onChange={(e) => setMessage(e.target.value)}
              required
              withAsterisk={false}
              mt='sm'
              minRows={4}
            />

            <Button
              type='submit'
              loading={loading}
              loaderProps={{ type: 'dots' }}
              fullWidth
              color='teal'
              mt='xl'
            >
              Enviar mensaje
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
