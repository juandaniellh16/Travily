import { ItinerariesList } from '@/components/ItinerariesList'
import { ItineraryListsList } from '@/components/ItineraryListsList'
import { UsersList } from '@/components/UsersList'
import { useAuth } from '@/hooks/useAuth'
import { itineraryListService } from '@/services/itineraryListService'
import { itineraryService } from '@/services/itineraryService'
import { userService } from '@/services/userService'
import { ItineraryListType, ItinerarySimpleType, UserWithFollowStatus } from '@/types'
import { Loader } from '@mantine/core'
import { useEffect, useState } from 'react'
import { IoIosArrowForward } from 'react-icons/io'
import { Link } from 'react-router'

export const Friends = () => {
  const { user: authUser, refreshUser } = useAuth()
  const [itineraries, setItineraries] = useState<ItinerarySimpleType[] | null>(null)
  const [lists, setLists] = useState<ItineraryListType[] | null>(null)
  const [suggestedUsers, setSuggestedUsers] = useState<UserWithFollowStatus[] | null>(null)

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        if (authUser) {
          const itinerariesData = await itineraryService.getAll({
            followedBy: authUser.id,
            visibility: 'all',
            sort: 'newest',
            limit: 3
          })
          setItineraries(itinerariesData)
        }
      } catch {
        console.error('Error fetching itineraries data')
      }
    }

    const fetchItineraryLists = async () => {
      try {
        if (authUser) {
          const lists = await itineraryListService.getAll({
            followedBy: authUser.id,
            visibility: 'all',
            sort: 'newest',
            limit: 3
          })
          setLists(lists)
        }
      } catch {
        console.error('Error fetching itineraries data')
      }
    }

    const fetchSuggestedUsers = async () => {
      if (authUser) {
        try {
          const users = await userService.getSuggestedUsers({ limit: 5 })
          setSuggestedUsers(users)
        } catch {
          console.error('Error fetching suggested users')
        }
      }
    }

    fetchItineraries()
    fetchItineraryLists()
    fetchSuggestedUsers()
  }, [authUser])

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      setSuggestedUsers((prev) =>
        prev ? prev.map((f) => (f.id === userId ? { ...f, isFollowing: !isFollowing } : f)) : null
      )
      if (isFollowing) {
        await userService.unfollowUser(userId)
      } else {
        await userService.followUser(userId)
      }
      await refreshUser()
    } catch {
      console.error('Error updating follow status')
    }
  }

  if (!authUser || itineraries === null || suggestedUsers === null) {
    return (
      <div className='flex items-center justify-center w-full my-[25%]'>
        <Loader color='brand' />
      </div>
    )
  }

  return (
    <div className='flex flex-col justify-center px-8'>
      <div className='flex items-center justify-between mb-5'>
        <h2 className='text-xl font-medium md:text-2xl w-[75%]'>
          Itinerarios recientes de tus amigos
        </h2>
        <Link to={`/friends/itineraries`} className='text-sm font-medium text-brand-600'>
          <div className='flex items-center gap-0.5 leading-none pt-0.5'>
            <span>Ver todos</span>
            <IoIosArrowForward size={14} strokeWidth={2} />
          </div>
        </Link>
      </div>
      <div className='w-full'>
        {itineraries.length === 0 ? (
          <p className='mt-6 text-center text-gray-500'>
            En este momento no se encuentran itinerarios. Inténtalo más tarde.
          </p>
        ) : (
          <ItinerariesList itineraries={itineraries ?? []} handleDelete={() => {}} />
        )}
      </div>
      <div className='flex items-center justify-between mt-8 mb-5'>
        <h2 className='text-xl font-medium md:text-2xl w-[75%]'>Listas recientes de tus amigos</h2>
        <Link to={`/friends/lists`} className='text-sm font-medium text-brand-600'>
          <div className='flex items-center gap-0.5 leading-none pt-0.5'>
            <span>Ver todas</span>
            <IoIosArrowForward size={14} strokeWidth={2} />
          </div>
        </Link>
      </div>
      <div className='w-full'>
        {itineraries.length === 0 ? (
          <p className='mt-6 text-center text-gray-500'>
            En este momento no se encuentran listas. Inténtalo más tarde.
          </p>
        ) : (
          <ItineraryListsList lists={lists ?? []} handleDelete={() => {}} />
        )}
      </div>
      <div className='flex items-center justify-between mt-8 mb-5'>
        <h2 className='text-xl font-medium md:text-2xl w-[75%]'>Conecta con otros usuarios</h2>
        <Link to={`/connect`} className='text-sm font-medium text-brand-600'>
          <div className='flex items-center gap-0.5 leading-none pt-0.5'>
            <span>Ver todos</span>
            <IoIosArrowForward size={14} strokeWidth={2} />
          </div>
        </Link>
      </div>
      <div className='w-full'>
        {suggestedUsers.length === 0 ? (
          <p className='mt-6 text-center text-gray-500'>
            En este momento no se encuentran usuarios. Inténtalo más tarde.
          </p>
        ) : (
          <UsersList users={suggestedUsers} handleFollow={handleFollow} />
        )}
      </div>
    </div>
  )
}
