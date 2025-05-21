import { Outlet } from 'react-router'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNavBar } from '@/components/layout/BottomNavBar'

export const AuthLayout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex justify-center flex-grow my-6 mx-9'>
        <Outlet />
      </main>
      <Footer />
      <div className='block sm:hidden'>
        <BottomNavBar defaultActiveButton='profile' />
      </div>
    </div>
  )
}
