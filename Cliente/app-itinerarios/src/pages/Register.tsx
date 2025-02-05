import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@mantine/core'

const API_URL = 'http://localhost:3000'

export const Register = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null
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
      navigate('/login')
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
    <div className='w-full'>
      <h1 className='text-xl font-medium text-center'>Register</h1>
      {error && <p className='text-center text-red-500'>{error}</p>}

      <form onSubmit={handleSubmit} className='m-y-4'>
        <input
          type='text'
          placeholder='Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          className='w-full px-4 py-2 border rounded-lg'
          required
        />
        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='w-full px-4 py-2 border rounded-lg'
          required
        />
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full px-4 py-2 border rounded-lg'
          required
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='w-full px-4 py-2 border rounded-lg'
          required
        />
        <input
          type='file'
          onChange={handleAvatarChange}
          accept='.png, .jpg, .jpeg'
        />
        <Button
          type='submit'
          loading={loading}
          loaderProps={{ type: 'dots' }}
          fullWidth
          className='py-2 text-white bg-blue-500 rounded-lg'
        >
          Register
        </Button>
      </form>
    </div>
  )
}
