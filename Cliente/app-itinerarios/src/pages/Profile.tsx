import { FollowersFollowingTabs } from '@/components/FollowersFollowingTabs'
import { ProfileCard } from '@/components/ProfileCard'
import { useAuth } from '@/hooks/useAuth'
import { ActiveTab } from '@/layouts/MainLayout'
import { itineraryService } from '@/services/itineraryService'
import { userService } from '@/services/userService'
import { ItinerarySimpleType, UserWithFollowStatus } from '@/types'
import { Loader, Modal, ScrollArea, SegmentedControl } from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams
} from 'react-router-dom'
import { NotFound } from './NotFound'
import { ItinerariesList } from '@/components/ItinerariesList'
import { IoIosArrowForward } from 'react-icons/io'

export const Profile = () => {
  const { user: authUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { username } = useParams()
  const [userId, setUserId] = useState<string | null>(null)
  const [followers, setFollowers] = useState<UserWithFollowStatus[] | null>(
    null
  )
  const [following, setFollowing] = useState<UserWithFollowStatus[] | null>(
    null
  )
  const [opened, setOpened] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingTab, setLoadingTab] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const scrollPosition = useRef(0)
  const [notFoundError, setNotFoundError] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserId = async () => {
      if (username) {
        try {
          const userData = await userService.getByUsername(username)
          setUserId(userData.id)
        } catch {
          console.error('Error fetching user data')
          setNotFoundError(true)
        }
      }
    }

    fetchUserId()
  }, [username])

  useEffect(() => {
    setOpened(false)
    setLoadingProfile(true)
    setItineraries(null)
    setTimeout(() => setLoadingProfile(false), 500)
    setTimeout(() => {
      setFollowers(null)
      setFollowing(null)
      scrollPosition.current = 0
    }, 200)
  }, [username])

  const { activeTab, setActiveTab } = useOutletContext<{
    activeTab: ActiveTab
    setActiveTab: (tab: ActiveTab) => void
  }>()

  useEffect(() => {
    const stateTab = location.state?.tab as ActiveTab | undefined
    if (stateTab) {
      setActiveTab(stateTab)
    }
  }, [location.state?.tab, setActiveTab])

  const [itineraries, setItineraries] = useState<ItinerarySimpleType[] | null>(
    null
  )

  const handleDeleteItinerary = async (id: string) => {
    try {
      await itineraryService.delete(id)
      setItineraries((prev) =>
        prev ? prev.filter((itinerary) => itinerary.id !== id) : []
      )
    } catch {
      setError('Error al borrar el itinerario. Por favor, inténtalo de nuevo.')
    }
  }

  useEffect(() => {
    const fetchUserItineraries = async () => {
      try {
        if (userId) {
          let itinerariesData
          if (activeTab === 'Itinerarios') {
            itinerariesData = await itineraryService.getAll({
              userId: userId,
              visibility: authUser ? 'all' : 'public',
              limit: 3
            })
            setItineraries(itinerariesData)
          } else if (activeTab === 'Favoritos') {
            itinerariesData = await itineraryService.getAll({
              likedBy: userId,
              visibility: authUser ? 'all' : 'public',
              limit: 3
            })
            setItineraries(itinerariesData)
          } else if (activeTab === 'Listas') {
            setItineraries([])
          }
        }
      } catch {
        console.error('Error fetching itineraries')
      } finally {
        setTimeout(() => {
          setLoadingTab(false)
        }, 250)
      }
    }

    fetchUserItineraries()
  }, [userId, activeTab, authUser])

  useEffect(() => {
    const fetchFollowingData = async () => {
      if (userId) {
        if (location.state?.fromProfile) {
          if (location.pathname.includes('followers')) {
            try {
              const followers = await userService.getFollowers(userId)
              setFollowers(followers)
            } catch {
              console.error('Error fetching followers')
            }
          } else if (location.pathname.includes('following')) {
            try {
              const followingData = await userService.getFollowing(userId)
              setFollowing(followingData)
            } catch {
              console.error('Error fetching following')
            }
          }
        } else {
          setOpened(false)
          navigate(`/${username}`)
        }
      }
    }

    fetchFollowingData()
  }, [
    userId,
    location.state?.fromProfile,
    location.pathname,
    username,
    navigate
  ])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollPosition.current
    }
  }, [followers, following, authUser])

  if (notFoundError) {
    return <NotFound from='profile' />
  }
  if (!userId || loadingProfile || !itineraries) {
    return (
      <div className='flex items-center justify-center w-full h-full my-[25%]'>
        <Loader color='teal' />
      </div>
    )
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false)
          navigate(`/${username}`)
          scrollPosition.current = 0
        }}
        size='md'
        centered
        radius='lg'
        scrollAreaComponent={ScrollArea.Autosize.withProps({
          scrollbars: false
        })}
      >
        <div className='flex flex-col h-[70vh] px-2'>
          <FollowersFollowingTabs />
          <div
            ref={scrollRef}
            className='overflow-y-auto h-[70vh] mt-5'
            onScroll={() => {
              if (scrollRef.current) {
                scrollPosition.current = scrollRef.current.scrollTop
              }
            }}
          >
            <Outlet
              context={{
                followers,
                setFollowers,
                following,
                setFollowing
              }}
            />
          </div>
        </div>
      </Modal>
      <div className='w-full mb-5'>
        <ProfileCard setOpened={setOpened} />
        <div className='flex justify-center mt-4'>
          <SegmentedControl
            radius='md'
            size='sm'
            value={activeTab}
            onChange={(value) => {
              setLoadingTab(true)
              setActiveTab(value as ActiveTab)
            }}
            data={['Itinerarios', 'Favoritos', 'Listas']}
            withItemsBorders={false}
          />
        </div>
        <div className='flex items-center justify-between my-4'>
          <h2 className='text-xl font-medium'>{activeTab}</h2>
          {(activeTab === 'Itinerarios' || activeTab === 'Favoritos') && (
            <Link
              to={
                activeTab === 'Itinerarios'
                  ? `/${username}/itineraries`
                  : `/${username}/favorites`
              }
              className='text-sm font-medium text-emerald-600'
            >
              <div className='flex items-center gap-0.5 leading-none'>
                <span className='pb-0.5'>Ver todos</span>
                <IoIosArrowForward size={14} strokeWidth={2} />
              </div>
            </Link>
          )}
        </div>
        {loadingTab ? (
          <div className='flex items-center justify-center h-[295px] pb-[15%]'>
            <Loader color='teal' />
          </div>
        ) : activeTab === 'Listas' ? (
          <div className='flex items-center text-gray-500 justify-center h-[295px] pb-[15%]'>
            <span>Las listas estarán disponibles próximamente.</span>
          </div>
        ) : itineraries?.length === 0 ? (
          <div className='flex items-center text-gray-500 justify-center h-[295px] pb-[15%]'>
            <span>No hay itinerarios</span>
          </div>
        ) : (
          <ItinerariesList
            handleDelete={handleDeleteItinerary}
            itineraries={itineraries}
          />
        )}
      </div>
    </>
  )
}
