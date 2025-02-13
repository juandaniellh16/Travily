import { BottomNavBar } from '@/components/BottomNavBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { SideBar } from '@/components/SideBar'
import { Button } from '@mantine/core'
import { useState } from 'react'
import { FaPlus } from 'react-icons/fa'
import { Link, Outlet } from 'react-router-dom'

export type ActiveTab = 'Itinerarios' | 'Favoritos' | 'Listas'

export const MainLayout = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('Itinerarios')

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-grow px-6'>
        <div className='grid max-w-6xl grid-cols-5 gap-4 mx-auto'>
          <div className='hidden md:block flex-col self-start items-center col-span-1 bg-neutral-100 rounded-xl overflow-hidden sticky top-[75px]'>
            <SideBar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className='flex flex-col col-span-5 pb-6 rounded-xl md:col-span-3'>
            <Outlet context={{ activeTab, setActiveTab }} />
          </div>
          <div className='hidden md:block flex-col self-start items-center col-span-1 text-center bg-neutral-100 rounded-xl overflow-hidden sticky top-[75px]'>
            <Link to='/create-itinerary'>
              <Button
                variant='filled'
                color='teal'
                radius='xl'
                h={45}
                leftSection={<FaPlus size={12} />}
              >
                Nuevo itinerario
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <div className='block md:hidden'>
        <BottomNavBar />
      </div>
    </div>
  )
}
