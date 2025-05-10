import { Link } from 'react-router'

export const NotFound = ({ from }: { from?: string }) => {
  return (
    <>
      <div className='w-full px-8 pt-5 pb-8 mx-auto lg:pb-16 lg:pt-[52px]'>
        <div className='max-w-lg mx-auto text-center'>
          <h1 className='mb-4 font-extrabold tracking-tight text-8xl lg:text-9xl text-brand-500'>
            404
          </h1>
          <p className='mb-4 text-2xl font-bold tracking-tight text-gray-900 md:text-3xl dark:text-white'>
            {from && from === 'profile'
              ? 'Oops! Esta cuenta no existe.'
              : 'Oops! La página que buscas no existe.'}
          </p>
          <p className='mb-4 text-lg font-light text-gray-700 dark:text-gray-400'>
            {from && from === 'profile'
              ? 'Intenta hacer otra búsqueda.'
              : 'Es posible que la URL sea incorrecta o que la página haya sido movida.'}
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
