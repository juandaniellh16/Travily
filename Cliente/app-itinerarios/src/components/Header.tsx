import { Link, useNavigate } from 'react-router-dom'
import { ColorSchemeToggle } from './ColorSchemeToggle'
import { Avatar, Button, Menu } from '@mantine/core'
import { useAuth } from '@/hooks/useAuth'
import { NotificationBell } from './NotificationBell'
import { FaUser } from 'react-icons/fa'
import { IoSettingsSharp } from 'react-icons/io5'
import { TbLogout } from 'react-icons/tb'

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
    <header className='sticky top-0 z-50 px-3 py-3 mb-3 bg-white border-b sm:px-6'>
      <div className='flex items-center justify-between max-w-6xl mx-auto gap-y-0'>
        <Link to='/'>
          <img src='/logo-prueba.png' alt='Logo' className='h-9' />
        </Link>
        <div className='flex items-center gap-1.5 sm:gap-3'>
          <div className='hidden sm:block'>
            <ColorSchemeToggle />
          </div>
          {user && (
            <>
              <div className='hidden sm:block'>
                <NotificationBell />
              </div>
              <Menu position='bottom-end' withArrow shadow='md'>
                <Menu.Target>
                  <Avatar
                    src={user.avatar || '/images/default-avatar.svg'}
                    className='cursor-pointer'
                  />
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<FaUser size={15} />}
                    onClick={() => navigate(`/${user.username}`)}
                  >
                    Mi perfil
                  </Menu.Item>

                  <Menu.Item leftSection={<IoSettingsSharp size={15} />}>
                    Configuración
                  </Menu.Item>

                  <Menu.Divider />

                  <Button
                    color='teal'
                    onClick={handleLogout}
                    leftSection={<TbLogout size={15} />}
                    fullWidth
                  >
                    Cerrar sesión
                  </Button>
                </Menu.Dropdown>
              </Menu>
            </>
          )}
          {user ? (
            <span></span>
          ) : (
            <>
              <Link to='/login'>
                <Button
                  variant='outline'
                  color='teal'
                  radius='xl'
                  className='text-nowrap !py-1 !px-3 !text-[13px] sm:!py-2 sm:!px-4 sm:!text-sm'
                >
                  Iniciar sesión
                </Button>
              </Link>
              <Link to='/register'>
                <Button
                  variant='filled'
                  color='teal'
                  radius='xl'
                  className='text-nowrap !py-1 !px-3 !text-[13px] sm:!py-2 sm:!px-4 sm:!text-sm'
                >
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
