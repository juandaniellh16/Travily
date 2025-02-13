import { Link, useNavigate } from 'react-router-dom'
import { ColorSchemeToggle } from './ColorSchemeToggle'
import { Avatar, Button } from '@mantine/core'
import { useAuth } from '@/hooks/useAuth'
import { NotificationBell } from './NotificationBell'

export const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      if (error instanceof Error) {
        // Handle error
      } else {
        // Handle error
      }
    }
  }

  return (
    <header className='sticky top-0 z-50 px-6 py-3 mb-3 bg-white border-b'>
      <div className='flex items-center justify-between max-w-6xl mx-auto gap-y-0'>
        <Link to='/'>
          <img src='/logo-prueba.png' alt='Logo' className='h-9' />
        </Link>
        <div className='flex items-center gap-4'>
          <ColorSchemeToggle />
          {user && (
            <>
              <NotificationBell />
              <Link to='/profile'>
                <Avatar src={user?.avatar || '/images/default-avatar.svg'} />
              </Link>
            </>
          )}
          {user ? (
            <Button
              variant='outline'
              color='teal'
              radius='xl'
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <>
              <Link to='/login'>
                <Button variant='outline' color='teal' radius='xl'>
                  Iniciar sesión
                </Button>
              </Link>
              <Link to='/register'>
                <Button variant='filled' color='teal' radius='xl'>
                  Regístrate
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
