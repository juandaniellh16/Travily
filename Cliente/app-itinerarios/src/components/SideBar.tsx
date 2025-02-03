import { NavLink } from '@mantine/core'
import { ProfileButton } from './ProfileButton'
import { IoShareSocialSharp } from 'react-icons/io5'
import { useState } from 'react'

export const SideBar = () => {
  const [active, setActive] = useState(0)

  return (
    <>
      <div className='w-full border-b'>
        <ProfileButton />
      </div>
      <div className='w-full my-2 overflow-hidden'>
        <NavLink
          href='https://www.google.com'
          key='Listas'
          active={true}
          label={<span className='flex leading-none'>Listas</span>}
          leftSection={
            <IoShareSocialSharp size={16} color='black' strokeWidth={1.5} />
          }
          onClick={() => setActive(0)}
          variant='subtle'
          color='black'
        />
        <NavLink
          href='https://www.google.com'
          key='Favoritos'
          active={true}
          label={<span className='flex leading-none'>Favoritos</span>}
          leftSection={
            <IoShareSocialSharp size={16} color='black' strokeWidth={1.5} />
          }
          onClick={() => setActive(0)}
          variant='subtle'
          color='black'
        />
      </div>
    </>
  )
}
