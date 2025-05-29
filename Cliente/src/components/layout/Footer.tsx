import { Link } from 'react-router'

export const Footer = () => {
  return (
    <footer className='w-full bg-gray-800'>
      <div className='px-4 mx-auto max-w-[1200px] sm:px-6'>
        <div className='flex flex-col items-center justify-between gap-8 py-9 lg:flex-row'>
          <Link to='/'>
            <img src='/logo-travily.png' className='h-9' alt='Logo' />
          </Link>
          <ul className='justify-center font-semibold text-center transition-all duration-500 text-md sm:flex items-cente gap-14 lg:gap-10 xl:gap-14'>
            <li className='my-2 sm:my-0'>
              <Link to={'/about-us'} className='text-white hover:text-gray-400'>
                Sobre nosotros
              </Link>
            </li>
            <li>
              <Link to={'/contact-us'} className='text-white hover:text-gray-400'>
                Contacto
              </Link>
            </li>
            <li className='my-2 sm:my-0'>
              <Link to={'/privacy-policy'} className='text-white hover:text-gray-400'>
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link to={'/terms-of-use'} className='text-white hover:text-gray-400'>
                Términos de uso
              </Link>
            </li>
          </ul>
          <div className='flex space-x-1 sm:justify-center '>
            <a
              href='https://github.com/juandaniellh16/Travily'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-center bg-gray-800 rounded-full w-9 h-9 hover:bg-emerald-500'
            >
              <svg
                className='w-[1.45rem] h-[1.30rem] text-white'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  fill='currentColor'
                  d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
                ></path>
              </svg>
            </a>
            <a
              href='https://www.linkedin.com/in/juan-daniel-lópez-hernández/'
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center justify-center bg-gray-800 rounded-full w-9 h-9 hover:bg-emerald-500'
            >
              <svg
                className='w-[1rem] h-[1rem] text-white'
                viewBox='-0.5 0 13 12'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M2.8794 11.5527V3.86835H0.318893V11.5527H2.87967H2.8794ZM1.59968 2.81936C2.4924 2.81936 3.04817 2.2293 3.04817 1.49188C3.03146 0.737661 2.4924 0.164062 1.61666 0.164062C0.74032 0.164062 0.167969 0.737661 0.167969 1.49181C0.167969 2.22923 0.723543 2.8193 1.5829 2.8193H1.59948L1.59968 2.81936ZM4.29668 11.5527H6.85698V7.26187C6.85698 7.03251 6.87369 6.80255 6.94134 6.63873C7.12635 6.17968 7.54764 5.70449 8.25514 5.70449C9.18141 5.70449 9.55217 6.4091 9.55217 7.44222V11.5527H12.1124V7.14672C12.1124 4.78652 10.8494 3.68819 9.16483 3.68819C7.78372 3.68819 7.17715 4.45822 6.84014 4.98267H6.85718V3.86862H4.29681C4.33023 4.5895 4.29661 11.553 4.29661 11.553L4.29668 11.5527Z'
                  fill='currentColor'
                />
              </svg>
            </a>
          </div>
        </div>

        <div className='pb-24 border-t border-gray-700 pt-7 md:pb-7'>
          <div className='flex items-center justify-center'>
            <span className='text-gray-400 '>
              © {new Date().getFullYear()}. Todos los derechos reservados.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
