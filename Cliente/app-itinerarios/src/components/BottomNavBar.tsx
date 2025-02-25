import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export const BottomNavBar = ({
  defaultActiveButton
}: {
  defaultActiveButton: string
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeButton, setActiveButton] = useState<string>(defaultActiveButton)

  return (
    <div className='fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 drop-shadow-[0_-4px_5px_rgba(0,0,0,0.04)] dark:bg-gray-700 dark:border-gray-600'>
      <div className='grid h-full grid-cols-5 mx-auto font-medium'>
        <Link
          to='/'
          className={`inline-flex flex-col items-center justify-center px-5
            ${
              activeButton === 'home'
                ? 'text-emerald-600 text-opacity-100'
                : 'text-emerald-700 text-opacity-80'
            } dark:text-gray-400 hover:text-opacity-100 hover:text-emerald-600 dark:hover:text-blue-500 group`}
          onClick={() => setActiveButton('home')}
        >
          {activeButton === 'home' ? (
            <svg
              className='w-8 h-8'
              viewBox='0 0 48 48'
              fill='currentColor'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
            >
              <g transform='translate(-1,-0.5) scale(1.05)'>
                <path d='M24.9505 7.84001C24.3975 7.38666 23.6014 7.38666 23.0485 7.84003L6.94846 21.04C6.45839 21.4418 6.2737 22.1083 6.48706 22.705C6.70041 23.3017 7.26576 23.7 7.89949 23.7H10.2311L11.4232 36.7278C11.5409 38.0149 12.6203 39 13.9128 39H21.5C22.0523 39 22.5 38.5523 22.5 38V28.3153C22.5 27.763 22.9477 27.3153 23.5 27.3153H24.5C25.0523 27.3153 25.5 27.763 25.5 28.3153V38C25.5 38.5523 25.9477 39 26.5 39H34.0874C35.3798 39 36.4592 38.0149 36.577 36.7278L37.7691 23.7H40.1001C40.7338 23.7 41.2992 23.3017 41.5125 22.705C41.7259 22.1082 41.5412 21.4418 41.0511 21.04L24.9505 7.84001Z'></path>
              </g>
            </svg>
          ) : (
            <svg
              className='w-8 h-8'
              viewBox='0 0 48 48'
              fill='currentColor'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g transform='translate(-1,-0.5) scale(1.05)'>
                <path d='M23.0484 7.84003C23.6014 7.38666 24.3975 7.38666 24.9504 7.84001L41.051 21.04C41.5411 21.4418 41.7258 22.1082 41.5125 22.705C41.2991 23.3017 40.7338 23.7 40.1 23.7H37.769L36.5769 36.7278C36.4592 38.0149 35.3798 39 34.0873 39H13.9127C12.6202 39 11.5409 38.0149 11.4231 36.7278L10.231 23.7H7.89943C7.2657 23.7 6.70035 23.3017 6.487 22.705C6.27364 22.1083 6.45833 21.4418 6.9484 21.04L23.0484 7.84003ZM23.9995 10.9397L12.0948 20.7H12.969L14.369 36H22.4994V28.3138C22.4994 27.7616 22.9471 27.3138 23.4994 27.3138H24.4994C25.0517 27.3138 25.4994 27.7616 25.4994 28.3138V36H33.631L35.031 20.7H35.9045L23.9995 10.9397Z'></path>
              </g>
            </svg>
          )}
          <span className='text-xs'>Inicio</span>
        </Link>
        <Link
          to='#'
          className={`inline-flex flex-col items-center justify-center px-5  
            ${
              activeButton === 'search'
                ? 'text-emerald-600 text-opacity-100'
                : 'text-emerald-700 text-opacity-80'
            } dark:text-gray-400 hover:text-opacity-100 hover:text-emerald-600 dark:hover:text-blue-500 group`}
          onClick={() => setActiveButton('search')}
        >
          {activeButton === 'search' ? (
            <svg
              className='w-8 h-8'
              viewBox='0 0 48 48'
              fill='currentColor'
              stroke='currentColor'
              strokeWidth={3}
              xmlns='http://www.w3.org/2000/svg'
            >
              <g transform='translate(6,6) scale(0.75)'>
                <path d='M21.83 7.5a14.34 14.34 0 1 1 0 28.68 14.34 14.34 0 0 1 0-28.68Zm0-4a18.33 18.33 0 1 0 11.48 32.64l8.9 8.9a1 1 0 0 0 1.42 0l1.4-1.41a1 1 0 0 0 0-1.42l-8.89-8.9A18.34 18.34 0 0 0 21.83 3.5Z'></path>
              </g>
            </svg>
          ) : (
            <svg
              className='w-8 h-8'
              viewBox='0 0 48 48'
              fill='currentColor'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g transform='translate(6,6) scale(0.75)'>
                <path d='M21.83 7.5a14.34 14.34 0 1 1 0 28.68 14.34 14.34 0 0 1 0-28.68Zm0-4a18.33 18.33 0 1 0 11.48 32.64l8.9 8.9a1 1 0 0 0 1.42 0l1.4-1.41a1 1 0 0 0 0-1.42l-8.89-8.9A18.34 18.34 0 0 0 21.83 3.5Z'></path>
              </g>
            </svg>
          )}
          <span className='text-xs'>Explorar</span>
        </Link>
        <div className='flex items-center justify-center'>
          <button
            type='button'
            className={`p-1 rounded-full shadow-md 
              ${
                activeButton === 'create' ? 'bg-emerald-600' : 'bg-emerald-500'
              } hover:bg-emerald-600 dark:text-gray-400 dark:hover:text-blue-500 dark:hover:bg-gray-800 group`}
            onClick={() => {
              if (user) {
                setActiveButton('create')
                navigate('/create-itinerary')
              } else {
                setActiveButton('')
                navigate('/login')
              }
            }}
          >
            <svg
              className='w-8 h-8'
              viewBox='0 0 24 24'
              fill='currentColor'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fill='white'
                d='M12.75 11.25V5a.75.75 0 1 0-1.5 0v6.25H5a.75.75 0 1 0 0 1.5h6.25V19a.75.75 0 1 0 1.5 0v-6.25H19a.75.75 0 1 0 0-1.5h-6.25z'
              ></path>
            </svg>
          </button>
        </div>
        <Link
          to='#'
          className={`inline-flex flex-col items-center justify-center px-5  
            ${
              activeButton === 'notifications'
                ? 'text-emerald-600 text-opacity-100'
                : 'text-emerald-700 text-opacity-80'
            } dark:text-gray-400 hover:text-opacity-100 hover:text-emerald-600 dark:hover:text-blue-500 group`}
          onClick={() => setActiveButton('notifications')}
        >
          {activeButton === 'notifications' ? (
            <svg
              className='w-8 h-8'
              viewBox='0 0 24 24'
              fill='currentColor'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g transform='translate(3,2.5) scale(0.8)'>
                <path d='M11.996 2c-4.062 0-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958C19.48 5.017 16.054 2 11.996 2zM9.171 18h5.658c-.412 1.165-1.523 2-2.829 2s-2.417-.835-2.829-2z'></path>
              </g>
            </svg>
          ) : (
            <svg
              className='w-8 h-8'
              viewBox='0 0 24 24'
              fill='currentColor'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g transform='translate(3,2.5) scale(0.8)'>
                <path d='M19.993 9.042C19.48 5.017 16.054 2 11.996 2s-7.49 3.021-7.999 7.051L2.866 18H7.1c.463 2.282 2.481 4 4.9 4s4.437-1.718 4.9-4h4.236l-1.143-8.958zM12 20c-1.306 0-2.417-.835-2.829-2h5.658c-.412 1.165-1.523 2-2.829 2zm-6.866-4l.847-6.698C6.364 6.272 8.941 4 11.996 4s5.627 2.268 6.013 5.295L18.864 16H5.134z'></path>
              </g>
            </svg>
          )}
          <span className='text-xs'>Notificaciones</span>
        </Link>
        <button
          type='button'
          className={`inline-flex flex-col items-center justify-center px-5  
            ${
              activeButton === 'profile'
                ? 'text-emerald-600 text-opacity-100'
                : 'text-emerald-700 text-opacity-80'
            } dark:text-gray-400 hover:text-opacity-100 hover:text-emerald-600 dark:hover:text-blue-500 group`}
          onClick={() => {
            if (user) {
              setActiveButton('profile')
              navigate(`/${user.username}`)
            } else {
              setActiveButton('')
              navigate('/login')
            }
          }}
        >
          {activeButton === 'profile' ? (
            <svg
              className='w-8 h-8'
              viewBox='0 0 24 24'
              fill='currentColor'
              stroke='currentColor'
              strokeWidth='1.5'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g transform='translate(3,3) scale(0.75)'>
                <path d='M12 11.796C14.7189 11.796 16.9231 9.60308 16.9231 6.89801C16.9231 4.19294 14.7189 2.00005 12 2.00005C9.28106 2.00005 7.07692 4.19294 7.07692 6.89801C7.07692 9.60308 9.28106 11.796 12 11.796Z' />
                <path d='M14.5641 13.8369H9.4359C6.46154 13.8369 4 16.2859 4 19.245C4 19.9593 4.30769 20.5716 4.92308 20.8777C5.84615 21.3879 7.89744 22.0001 12 22.0001C16.1026 22.0001 18.1538 21.3879 19.0769 20.8777C19.5897 20.5716 20 19.9593 20 19.245C20 16.1838 17.5385 13.8369 14.5641 13.8369Z' />
              </g>
            </svg>
          ) : (
            <svg
              className='w-8 h-8'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              xmlns='http://www.w3.org/2000/svg'
            >
              <g transform='translate(3,3) scale(0.75)'>
                <path
                  d='M12 11.796C14.7189 11.796 16.9231 9.60308 16.9231 6.89801C16.9231 4.19294 14.7189 2.00005 12 2.00005C9.28106 2.00005 7.07692 4.19294 7.07692 6.89801C7.07692 9.60308 9.28106 11.796 12 11.796Z'
                  fill='#ffffff'
                />
                <path
                  d='M14.5641 13.8369H9.4359C6.46154 13.8369 4 16.2859 4 19.245C4 19.9593 4.30769 20.5716 4.92308 20.8777C5.84615 21.3879 7.89744 22.0001 12 22.0001C16.1026 22.0001 18.1538 21.3879 19.0769 20.8777C19.5897 20.5716 20 19.9593 20 19.245C20 16.1838 17.5385 13.8369 14.5641 13.8369Z'
                  fill='#ffffff'
                />
              </g>
            </svg>
          )}
          <span className='text-xs'>Perfil</span>
        </button>
      </div>
    </div>
  )
}
