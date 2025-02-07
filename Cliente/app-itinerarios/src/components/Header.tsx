import { Link, useNavigate } from 'react-router-dom'
import { ColorSchemeToggle } from './ColorSchemeToggle'
import { Button } from '@mantine/core'
import { useAuth } from '@/hooks/useAuth'

export const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
      } else {
        console.error('Logout error')
      }
    }
  }

  return (
    <header className='sticky top-0 z-50 px-10 py-3 mb-3 bg-white border-b'>
      <div className='flex items-center justify-between max-w-6xl mx-auto gap-y-0'>
        <Link to='/'>
          <img src='/logo.png' alt='Logo' className='h-9' />
        </Link>

        <div className='flex items-center gap-5'>
          <ColorSchemeToggle />
          <Link to='/profile'>Profile</Link>
          {user ? (
            <Button
              variant='outline'
              color='teal'
              radius='xl'
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  backgroundColor: 'black',
                  color: 'white',
                  borderColor: 'black'
                }
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Link to='/login'>Login</Link>
              <Link to='/register'>Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
