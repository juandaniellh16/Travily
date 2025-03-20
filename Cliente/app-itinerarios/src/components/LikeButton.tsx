import { useAuth } from '@/hooks/useAuth'
import { itineraryService } from '@/services/itineraryService'
import { ItinerarySimpleType } from '@/types'
import { ActionIcon } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { LoginModal } from './LoginModal'
import { useLocation, useNavigate } from 'react-router-dom'

interface ItineraryCardProps {
  itinerary: ItinerarySimpleType
}

export const LikeButton = ({ itinerary }: ItineraryCardProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(itinerary.likes)
  const [opened, { open, close }] = useDisclosure(false)

  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const fetchLikedStatus = async () => {
      try {
        const likedStatus = await itineraryService.checkIfLiked(itinerary.id)
        setLiked(likedStatus)
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

    const previousLikedState = liked
    const previousLikesCount = likes
    try {
      if (!liked) {
        setLiked(!liked)
        setLikes(likes + 1)
        await itineraryService.like(itinerary.id)
      } else {
        setLiked(!liked)
        setLikes(likes - 1)
        await itineraryService.unlike(itinerary.id)
      }
    } catch {
      console.error('Error liking/unliking itinerary')
      setLiked(previousLikedState)
      setLikes(previousLikesCount)
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
      <div className='flex items-center justify-center'>
        <ActionIcon
          variant='subtle'
          color='gray'
          onClick={handleLike}
          w={36}
          size={24}
          p={3}
        >
          {liked ? (
            <FaHeart color='red' size={16} className='flex-none' />
          ) : (
            <FaRegHeart color='black' size={16} className='flex-none' />
          )}
          <span className='ml-1 text-sm leading-none pb-0.5 text-black cursor-default'>
            {likes}
          </span>
        </ActionIcon>
      </div>
    </>
  )
}
