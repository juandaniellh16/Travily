import { ItineraryCard } from '@/components/ItineraryCard'
import { SearchInput } from '@/components/SearchInput'
import { UsersList } from '@/components/UsersList'
import { useAuth } from '@/hooks/useAuth'
import { itineraryService } from '@/services/itineraryService'
import { userService } from '@/services/userService'
import { ItinerarySimpleType, UserWithFollowStatus } from '@/types'
import { Checkbox, Loader, Tabs } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

export const SearchResults = () => {
  const { user: authUser, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [itineraries, setItineraries] = useState<ItinerarySimpleType[] | null>(null)
  const [users, setUsers] = useState<UserWithFollowStatus[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'itinerary'
  const initialOnlyFriends = searchParams.get('onlyFriends') === 'true'

  const [onlyFriends, setOnlyFriends] = useState(initialOnlyFriends)

  useEffect(() => {
    if (!query) return

    const fetchResults = async () => {
      try {
        setLoading(true)
        if (type === 'itinerary') {
          let itineraryResults
          if (onlyFriends) {
            itineraryResults = await itineraryService.getAll({
              location: query,
              sort: 'popular',
              followedBy: authUser?.id
            })
          } else {
            itineraryResults = await itineraryService.getAll({
              location: query,
              sort: 'popular'
            })
          }
          setItineraries(itineraryResults)
        } else if (type === 'user') {
          const userResults = await userService.getAll({
            name: query,
            username: query
          })
          setUsers(userResults)
        }
      } catch {
        console.error('Error fetching search results')
        setError(true)
      } finally {
        setTimeout(() => {
          setLoading(false)
        }, 500)
      }
    }

    fetchResults()
  }, [query, type, onlyFriends, authUser?.id])

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      setUsers((prev) => {
        if (!prev) return prev

        return prev.map((f) => (f.id === userId ? { ...f, isFollowing: !isFollowing } : f))
      })
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

  return (
    <>
      <div className='flex flex-col items-center w-full px-8 pb-8 bg-white rounded-xl'>
        <h2 className='mb-4 text-2xl font-semibold text-center md:text-3xl'>
          Explora destinos y conecta <br />
          con otros viajeros
        </h2>
        <SearchInput defaultValue={query} onlyFriends={onlyFriends} />
        {authUser && (
          <div className='flex items-center justify-center mt-3'>
            <Checkbox
              label='Solo itinerarios de amigos'
              color='brand'
              checked={onlyFriends}
              onChange={() => {
                const newVal = !onlyFriends
                setOnlyFriends(newVal)

                const updatedParams = new URLSearchParams(searchParams)
                if (newVal && type === 'itinerary') {
                  updatedParams.set('onlyFriends', 'true')
                } else {
                  updatedParams.delete('onlyFriends')
                }
                setSearchParams(updatedParams)
              }}
              classNames={{
                label: 'text-sm md:text-[15px]'
              }}
            />
          </div>
        )}
      </div>

      {query && (
        <h3 className='text-lg text-center md:text-xl mx-7 md:mx-0'>
          Resultados de búsqueda para <br className='md:hidden' />"{query}"
        </h3>
      )}

      <div className='w-full mt-5 mb-8'>
        <Tabs
          color='brand'
          value={type}
          onChange={(value) => {
            if (value === 'itinerary') {
              setItineraries(null)
            } else if (value === 'user') {
              setUsers(null)
            }
            navigate(
              `/search?q=${query}&type=${value}${
                onlyFriends && value === 'itinerary' ? '&onlyFriends=true' : ''
              }`
            )
          }}
        >
          <Tabs.List grow className='mb-5'>
            <Tabs.Tab value='itinerary'>Itinerarios</Tabs.Tab>
            <Tabs.Tab value='user'>Usuarios</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='itinerary'>
            {query &&
              (loading || !itineraries ? (
                <div className='flex items-center justify-center w-full h-[295px]'>
                  <Loader color='brand' />
                </div>
              ) : error ? (
                <div className='flex items-center justify-center h-[295px] mx-8 md:mx-0'>
                  <span className='text-center text-gray-500'>
                    No se han podido obtener resultados en este momento.
                    <br />
                    Inténtalo más tarde.
                  </span>
                </div>
              ) : itineraries.length === 0 ? (
                <div className='flex items-center justify-center h-[295px] mx-8 md:mx-0'>
                  <span className='text-center text-gray-500'>
                    No se han encontrado resultados para "{query}" en itinerarios.
                  </span>
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-4 mx-8 xxs:mx-16 xs:mx-0 xs:grid-cols-2 md:!grid-cols-3'>
                  {itineraries.map((itinerary) => (
                    <div
                      key={itinerary.id}
                      className='flex h-[295px] overflow-hidden rounded-xl mb-5'
                    >
                      <ItineraryCard itinerary={itinerary} />
                    </div>
                  ))}
                </div>
              ))}
          </Tabs.Panel>

          <Tabs.Panel value='user'>
            {query &&
              (loading || !users ? (
                <div className='flex items-center justify-center w-full h-[295px]'>
                  <Loader color='brand' />
                </div>
              ) : error ? (
                <div className='flex items-center justify-center h-[295px] mx-8 md:mx-0'>
                  <span className='text-center text-gray-500'>
                    No se han podido obtener resultados en este momento.
                    <br />
                    Inténtalo más tarde.
                  </span>
                </div>
              ) : users.length === 0 ? (
                <div className='flex items-center justify-center h-[295px] mx-8 md:mx-0'>
                  <span className='text-center text-gray-500'>
                    No se han encontrado resultados para "{query}" en usuarios.
                  </span>
                </div>
              ) : (
                <div className='flex justify-center max-w-md sm:max-w-full mx-auto px-9'>
                  <UsersList users={users} handleFollow={handleFollow} />
                </div>
              ))}
          </Tabs.Panel>
        </Tabs>
      </div>
    </>
  )
}
