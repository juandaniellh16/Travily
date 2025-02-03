import { Link } from 'react-router-dom'
import { ColorSchemeToggle } from './ColorSchemeToggle'
import { Button } from '@mantine/core'

export const Header = () => {
  return (
    <header className='sticky top-0 z-50 px-10 py-3 mb-3 bg-white border-b h-15'>
      <div className='flex items-center justify-between max-w-6xl mx-auto gap-y-0'>
        <Link to='/'>
          <img src='/logo.png' alt='Logo' className='h-9' />
        </Link>

        <div className='flex items-center gap-5'>
          <Link to='/create-itinerary'>
            <Button variant='filled'>Nuevo itinerario</Button>
          </Link>
          <Link to='/register'>Register</Link>
          <Link to='/login'>Login</Link>
          <Link to='/profile'>Profile</Link>
          <ColorSchemeToggle />
        </div>
      </div>
    </header>
  )
}
