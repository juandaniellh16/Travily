import { ItineraryCard } from '@/components/ItineraryCard'
import { SearchInput } from '@/components/SearchInput'
import { UsersList } from '@/components/UsersList'
import { useAuth } from '@/hooks/useAuth'
import { itineraryService } from '@/services/itineraryService'
import { userService } from '@/services/userService'
import { ItinerarySimpleType, UserWithFollowStatus } from '@/types'
import { Loader, Tabs } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const SearchResults = () => {
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const [itineraries, setItineraries] = useState<ItinerarySimpleType[] | null>(
    null
  )
  const [users, setUsers] = useState<UserWithFollowStatus[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'itinerary'

  useEffect(() => {
    if (!query) return

    const fetchResults = async () => {
      try {
        setLoading(true)
        if (type === 'itinerary') {
          const itineraryResults = await itineraryService.getAll({
            location: query,
            sort: 'popular'
          })
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
  }, [query, type])

  const handleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      setUsers((prev) => {
        if (!prev) return prev

        return prev.map((f) =>
          f.id === userId ? { ...f, isFollowing: !isFollowing } : f
        )
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
        <SearchInput defaultValue={query} />
      </div>

      {query && (
        <h3 className='text-lg text-center md:text-xl'>
          Resultados de búsqueda para "{query}"
        </h3>
      )}

      <div className='w-full mt-5 mb-8'>
        <Tabs
          color='teal'
          value={type}
          onChange={(value) => {
            if (value === 'itinerary') {
              setItineraries(null)
            } else if (value === 'user') {
              setUsers(null)
            }
            navigate(`/search?q=${query}&type=${value}`)
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
                  <Loader color='teal' />
                </div>
              ) : error ? (
                <div className='flex items-center justify-center h-[295px] mx-9 md:mx-0'>
                  <span className='text-center text-gray-500'>
                    No se han podido obtener resultados en este momento.
                    <br />
                    Inténtalo más tarde.
                  </span>
                </div>
              ) : itineraries.length === 0 ? (
                <div className='flex items-center justify-center h-[295px] mx-9 md:mx-0'>
                  <span className='text-center text-gray-500'>
                    No se han encontrado resultados para "{query}" en
                    itinerarios.
                  </span>
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-4 mx-9 xxs:mx-16 xs:mx-0 xs:grid-cols-2 md:!grid-cols-3'>
                  {itineraries.map((itinerary) => (
                    <div
                      key={itinerary.id}
                      className='flex h-[295px] overflow-hidden rounded-xl'
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
                  <Loader color='teal' />
                </div>
              ) : error ? (
                <div className='flex items-center justify-center h-[295px] mx-9 md:mx-0'>
                  <span className='text-center text-gray-500'>
                    No se han podido obtener resultados en este momento.
                    <br />
                    Inténtalo más tarde.
                  </span>
                </div>
              ) : users.length === 0 ? (
                <div className='flex items-center justify-center h-[295px] mx-9 md:mx-0'>
                  <span className='text-center text-gray-500'>
                    No se han encontrado resultados para "{query}" en usuarios.
                  </span>
                </div>
              ) : (
                <div className='w-full h-[295px] mx-9 md:mx-0'>
                  <UsersList users={users} handleFollow={handleFollow} />
                </div>
              ))}
          </Tabs.Panel>
        </Tabs>
      </div>
    </>
  )
}
