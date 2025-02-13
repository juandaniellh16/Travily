import { ItineraryCard } from '@/components/ItineraryCard'
import { ProfileCard } from '@/components/ProfileCard'
import { useAuth } from '@/hooks/useAuth'
import { ActiveTab } from '@/layouts/MainLayout'
import { itineraryService } from '@/services/itineraryService'
import { ItinerarySimpleType } from '@/types'
import { Carousel } from '@mantine/carousel'
import { Group, SegmentedControl, Skeleton } from '@mantine/core'
import { useEffect, useState } from 'react'
import { useLocation, useOutletContext, useParams } from 'react-router-dom'

export const Profile = () => {
  const [loading, setLoading] = useState(true)
  const { userId } = useParams()
  const { user } = useAuth()
  const location = useLocation()
  const profileUserId = userId || user?.id

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timeout)
  }, [])

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

  const [itineraries, setItineraries] = useState<ItinerarySimpleType[]>([])

  useEffect(() => {
    const fetchUserItineraries = async () => {
      try {
        if (profileUserId) {
          let itinerariesData
          if (activeTab === 'Itinerarios') {
            itinerariesData = await itineraryService.getAll({
              userId: profileUserId
            })
          } else if (activeTab === 'Favoritos') {
            itinerariesData = await itineraryService.getAll({
              likedBy: profileUserId
            })
          }
          setItineraries(itinerariesData)
        }
      } catch {
        console.error('Error fetching itineraries')
      }
    }

    fetchUserItineraries()
  }, [profileUserId, activeTab])

  return (
    <div className='w-full mb-5'>
      <ProfileCard />
      <div className='flex justify-center mt-4'>
        <SegmentedControl
          radius='md'
          size='sm'
          value={activeTab}
          onChange={(value) => setActiveTab(value as ActiveTab)}
          data={['Itinerarios', 'Favoritos', 'Listas']}
          withItemsBorders={false}
        />
      </div>
      <h2 className='my-4 text-xl font-medium'>{activeTab}</h2>
      {loading || itineraries.length === 0 ? (
        <Group gap='xs' align='center' wrap='nowrap'>
          <Skeleton animate={loading} height={300} radius={12} />
          <Skeleton animate={loading} height={300} radius={12} />
          <Skeleton animate={loading} height={300} radius={12} />
        </Group>
      ) : (
        <Carousel
          height={300}
          slideSize={{ base: '60%', sm: '45%', md: '55%', lg: '33.33333%' }}
          slideGap='xs'
          align='center'
          initialSlide={0}
          slidesToScroll='auto'
          loop
        >
          {itineraries.map((itinerary) => (
            <Carousel.Slide key={itinerary.id}>
              <ItineraryCard itinerary={itinerary} />
            </Carousel.Slide>
          ))}
        </Carousel>
      )}
    </div>
  )
}
