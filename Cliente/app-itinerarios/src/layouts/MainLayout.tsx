import { BottomNavBar } from '@/components/BottomNavBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { RightColumn } from '@/components/RightColumn'
import { SideBar } from '@/components/SideBar'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

export type ActiveTab = 'Itinerarios' | 'Favoritos' | 'Listas'

export const MainLayout = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('Itinerarios')

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-grow px-3 sm:px-6'>
        <div className='grid max-w-6xl grid-cols-5 gap-5 mx-auto'>
          <div className='hidden lg:block flex-col self-start items-center col-span-1 overflow-hidden sticky top-[75px]'>
            <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className='flex flex-col col-span-5 pb-6 rounded-xl lg:col-span-3'>
            <Outlet context={{ activeTab, setActiveTab }} />
          </div>
          <div className='hidden lg:block flex-col self-start items-center col-span-1 text-center overflow-hidden sticky top-[75px]'>
            <RightColumn />
          </div>
        </div>
      </main>
      <Footer />
      <div className='block sm:hidden'>
        <BottomNavBar defaultActiveButton='home' />
      </div>
    </div>
  )
}
