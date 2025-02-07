import { ProfileButton } from './ProfileButton'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActiveTab } from '@/layouts/MainLayout'
import { FaRegHeart } from 'react-icons/fa'
import { FiMap } from 'react-icons/fi'
import { IoIosList } from 'react-icons/io'

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

  const isOnOwnProfile = location.pathname === '/profile'

  const handleTabClick = (tab: ActiveTab) => {
    if (!isOnOwnProfile) {
      setActiveTab?.(tab)
      navigate('/profile', { state: { tab } })
    } else if (activeTab !== tab) {
      setActiveTab?.(tab)
    }
  }

  return (
    <>
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
                ? 'bg-teal-500 text-white'
                : 'bg-transparent text-black hover:bg-teal-500 hover:text-white'
            }
            hover:transition-all hover:duration-200 
          `}
          >
            {getIconForTab(tab)}
            {tab}
          </button>
        ))}
      </div>
    </>
  )
}
