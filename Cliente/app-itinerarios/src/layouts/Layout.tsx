import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { SideBar } from '@/components/SideBar'
import { Outlet } from 'react-router-dom'

export const Layout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-grow px-10'>
        <div className='grid max-w-6xl grid-cols-5 grid-rows-1 gap-4 mx-auto'>
          <div className='flex flex-col self-start items-center col-span-1 bg-neutral-100 rounded-xl overflow-hidden sticky top-[76px]'>
            <SideBar />
          </div>
          <div className='flex flex-col items-center col-span-3'>
            <Outlet />
          </div>
          <div className='flex flex-col items-center self-start col-span-1 bg-neutral-100 rounded-xl'></div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
