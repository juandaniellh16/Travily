import { Link, useNavigate } from 'react-router-dom'
import { ColorSchemeToggle } from './ColorSchemeToggle'
import { Avatar, Button, Menu } from '@mantine/core'
import { useAuth } from '@/hooks/useAuth'
import { NotificationBell } from './NotificationBell'
import { FaUser } from 'react-icons/fa'
import { IoSettingsSharp } from 'react-icons/io5'
import { TbLogout } from 'react-icons/tb'

export const Header = () => {
  const { user, isLoading, logout } = useAuth()
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
    <header className='sticky top-0 z-50 px-4 py-3 mb-3 bg-white border-b sm:px-6'>
      <div className='flex items-center justify-between mx-auto max-w-[1200px] gap-y-0'>
        <Link to='/'>
          <img src='/logo-prueba-2.png' alt='Logo' className='h-9' />
        </Link>
        {!isLoading && (
          <div className='flex items-center gap-1.5 sm:gap-3'>
            <div className='hidden sm:block'>
              <ColorSchemeToggle />
            </div>
            {user && (
              <>
                <div className='hidden sm:block'>
                  <NotificationBell />
                </div>
                <Menu position='bottom-end' shadow='md' width={160} withArrow>
                  <Menu.Target>
                    <Avatar
                      src={user.avatar || '/images/default-avatar.svg'}
                      className='cursor-pointer'
                    />
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item
                      h={40}
                      leftSection={<FaUser size={15} />}
                      onClick={() => navigate(`/${user.username}`)}
                    >
                      Mi perfil
                    </Menu.Item>

                    <Menu.Item
                      h={40}
                      leftSection={<IoSettingsSharp size={15} />}
                      onClick={() => navigate('/settings')}
                    >
                      Configuración
                    </Menu.Item>

                    <Menu.Divider />

                    <Button
                      color='teal'
                      h={40}
                      onClick={handleLogout}
                      leftSection={<TbLogout size={15} />}
                      fullWidth
                      className='!flex'
                    >
                      Cerrar sesión
                    </Button>
                  </Menu.Dropdown>
                </Menu>
              </>
            )}
            {!user && (
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
        )}
      </div>
    </header>
  )
}
