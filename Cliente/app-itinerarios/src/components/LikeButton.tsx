import { API_BASE_URL } from '@/config/config'
import { useAuth } from '@/hooks/useAuth'
import { itineraryService } from '@/services/itineraryService'
import { ItinerarySimpleType } from '@/types'
import { ActionIcon } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { LoginModal } from './LoginModal'

interface ItineraryCardProps {
  itinerary: ItinerarySimpleType
}

export const LikeButton = ({ itinerary }: ItineraryCardProps) => {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(itinerary.likes)
  const [opened, { open, close }] = useDisclosure(false)

  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const fetchLikedStatus = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/itineraries/${itinerary.id}/liked?userId=${user.id}`
        )
        const data = await response.json()
        setLiked(data.liked)
      } catch {
        console.error('Error fetching liked status')
      }
    }

    fetchLikedStatus()
  }, [user, itinerary.id])

  const handleLike = async () => {
    if (!user) {
      open()
      return
    }

    try {
      if (!liked) {
        await itineraryService.like(itinerary.id, user.id)
        setLikes(likes + 1)
      } else {
        await itineraryService.unlike(itinerary.id, user.id)
        setLikes(likes - 1)
      }
      setLiked(!liked)
    } catch {
      console.error('Error liking/unliking itinerary')
    }
  }

  return (
    <>
      <LoginModal opened={opened} close={close} />
      <div className='flex items-center'>
        <span className='mr-1 text-xs text-black'>{likes}</span>
        <ActionIcon
          variant='subtle'
          color='gray'
          onClick={handleLike}
          size={24}
          p={3}
        >
          {liked ? <FaHeart color='red' /> : <FaRegHeart color='black' />}
        </ActionIcon>
      </div>
    </>
  )
}
