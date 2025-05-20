import { ProfileButton } from '../users/profile/ProfileButton'
import { useLocation, useNavigate } from 'react-router'
import { ActiveTab } from '@/layouts/MainLayout'
import { FaPlus, FaRegHeart } from 'react-icons/fa'
import { FiMap } from 'react-icons/fi'
import { IoIosList } from 'react-icons/io'
import { useAuth } from '@/hooks/useAuth'
import { useDisclosure } from '@mantine/hooks'
import { LoginModal } from '../ui/LoginModal'
import { useState } from 'react'
import { Button } from '@mantine/core'

type SideBarProps = {
  activeTab?: ActiveTab
  setActiveTab?: (tab: ActiveTab) => void
}

const getIconForTab = (tab: ActiveTab) => {
  switch (tab) {
    case 'Itinerarios':
      return <FiMap size={16} strokeWidth={1.5} className='mr-2' />
    case 'Favoritos':
      return <FaRegHeart size={16} strokeWidth={1.5} className='mr-2' />
    case 'Listas':
      return <IoIosList size={16} strokeWidth={1.5} className='mr-2' />
    default:
      return null
  }
}

export const SideBar = ({ activeTab, setActiveTab }: SideBarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [tab, setTab] = useState<ActiveTab | null>(null)
  const [opened, { open, close }] = useDisclosure(false)

  const isOnOwnProfile = location.pathname === `/${user?.username}`

  const handleTabClick = (tab: ActiveTab) => {
    if (!user) {
      setTab(tab)
      open()
      return
    }

    if (!isOnOwnProfile) {
      setActiveTab?.(tab)
      navigate(`/${user.username}`, { state: { tab } })
    } else if (activeTab !== tab) {
      setActiveTab?.(tab)
    }
  }

  return (
    <>
      <LoginModal
        opened={opened}
        close={close}
        onLoginSuccess={() => {
          close()
          navigate(`/${user?.username}`, { state: { tab } })
        }}
      />
      <div className='overflow-hidden bg-neutral-100 rounded-xl'>
        <div className='w-full border-b'>
          <ProfileButton />
        </div>
        <div className='w-full mb-3 overflow-hidden'>
          {(['Itinerarios', 'Favoritos', 'Listas'] as ActiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`
            w-full text-left flex items-center px-4 py-2 h-10 leading-none
            ${
              isOnOwnProfile && activeTab === tab
                ? 'bg-emerald-500 text-white'
                : 'bg-transparent text-black hover:bg-emerald-500 hover:text-white'
            }
            hover:transition-all hover:duration-200 
          `}
            >
              {getIconForTab(tab)}
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className='flex justify-center w-full my-3'>
        <Button
          variant='filled'
          color='brand'
          radius='xl'
          h={45}
          leftSection={<FaPlus size={12} />}
          className='w-full text-nowrap'
          onClick={() => {
            if (user) {
              navigate('/create-itinerary')
            } else {
              open()
            }
          }}
        >
          Nuevo itinerario
        </Button>
      </div>
    </>
  )
}
