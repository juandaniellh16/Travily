import { Outlet } from 'react-router-dom'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export const AuthLayout = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex justify-center flex-grow px-10 mt-6'>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
