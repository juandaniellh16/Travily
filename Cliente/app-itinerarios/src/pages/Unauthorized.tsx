import { Link } from 'react-router-dom'

export const Unauthorized = () => {
  return (
    <>
      <div className='w-full px-8 pt-5 pb-8 mx-auto lg:pb-16 lg:pt-[52px]'>
        <div className='max-w-lg mx-auto text-center'>
          <h1 className='mb-4 font-extrabold tracking-tight text-8xl lg:text-9xl text-emerald-500'>
            401
          </h1>
          <p className='mb-4 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white'>
            Oops! Acceso no autorizado.
          </p>
          <p className='mb-4 text-lg font-light text-gray-700 dark:text-gray-400'>
            No tienes permiso para acceder a esta página.
          </p>
          <Link
            to='/'
            className='inline-flex px-6 py-3 my-4 font-semibold text-center text-white transition-all duration-200 rounded-lg bg-emerald-500 hover:bg-emerald-600'
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </>
  )
}
