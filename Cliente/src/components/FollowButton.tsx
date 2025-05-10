import { useAuth } from '@/hooks/useAuth'
import { UserWithFollowStatus } from '@/types'
import { Button, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useEffect, useRef, useState } from 'react'
import { BiSolidUserX } from 'react-icons/bi'
import { useNavigate, useLocation } from 'react-router'
import { LoginModal } from './LoginModal'

interface FollowButtonProps {
  user: UserWithFollowStatus
  handleFollow: (id: string, isFollowing: boolean) => void
}

export const FollowButton = ({ user, handleFollow }: FollowButtonProps) => {
  const { user: authUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = window.innerWidth <= 768
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [opened, { open, close }] = useDisclosure(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleClick = (e: React.SyntheticEvent<HTMLButtonElement>) => {
    if (!authUser) {
      open()
      return
    }

    if (isMobile && user.isFollowing) {
      e.preventDefault()
      setDropdownOpen(!dropdownOpen)
    } else {
      handleFollow(user.id, user.isFollowing)
    }
  }

  return (
    <>
      <LoginModal
        opened={opened}
        close={close}
        onLoginSuccess={() => {
          close()
          navigate(location.state?.from?.pathname || '/')
        }}
      />
      <div className='relative'>
        <Button
          ref={buttonRef}
          radius='xl'
          size='sm'
          variant={user.isFollowing ? 'outline' : 'filled'}
          color='brand'
          className={`self-center text-nowrap border !py-1 !px-2 !text-[13px]
            ${
              user.isFollowing
                ? 'group relative md:hover:!text-red-500 md:hover:!border-red-500 md:hover:!bg-transparent'
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          onClick={handleClick}
        >
          {!isMobile ? (
            <>
              <span className='group-hover:hidden min-w-[100px]'>
                {user.isFollowing ? 'Siguiendo' : 'Seguir'}
              </span>
              <span className='hidden group-hover:inline min-w-[100px]'>
                {user.isFollowing ? 'Dejar de seguir' : 'Seguir'}
              </span>
            </>
          ) : (
            <span className='min-w-[100px]'>{user.isFollowing ? 'Siguiendo' : 'Seguir'}</span>
          )}
        </Button>

        {isMobile && dropdownOpen && (
          <div
            ref={dropdownRef}
            className='absolute z-10 mt-1 overflow-hidden transition-none bg-white border rounded-md shadow-md w-44 right-3 top-full'
          >
            <button
              className='w-full px-3 py-2 text-sm text-left text-red-500 hover:bg-gray-100'
              onClick={() => {
                setDropdownOpen(!dropdownOpen)
                handleFollow(user.id, true)
              }}
            >
              <span className='flex items-center justify-between w-full'>
                <div className='flex flex-col w-[75%] overflow-hidden'>
                  <span>Dejar de seguir a</span>
                  <span>
                    <Text truncate='end' className='!text-sm'>
                      @{user.username}
                    </Text>
                  </span>
                </div>
                <BiSolidUserX size={22} />
              </span>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
