import { useAuth } from '@/hooks/useAuth'
import { itineraryService } from '@/services/itineraryService'
import { ItineraryListType, ItinerarySimpleType } from '@/types'
import { ActionIcon } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { LoginModal } from '../ui/LoginModal'
import { useLocation, useNavigate } from 'react-router'
import { itineraryListService } from '@/services/itineraryListService'

interface ItineraryCardProps {
  itinerary?: ItinerarySimpleType
  itineraryList?: ItineraryListType
}

export const LikeButton = ({ itinerary, itineraryList }: ItineraryCardProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(itinerary?.likes || itineraryList?.likes || 0)
  const [opened, { open, close }] = useDisclosure(false)

  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    const id = itinerary?.id || itineraryList?.id
    if (!id) return

    const fetchLikedStatus = async () => {
      try {
        let likedStatus
        if (itinerary) {
          likedStatus = await itineraryService.checkIfLiked(id)
          setLiked(likedStatus)
        } else if (itineraryList) {
          likedStatus = await itineraryListService.checkIfLiked(id)
          setLiked(likedStatus)
        }
      } catch {
        console.error('Error fetching liked status')
      }
    }

    fetchLikedStatus()
  }, [user, itinerary, itineraryList])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (!user) {
      open()
      return
    }

    const previousLikedState = liked
    const previousLikesCount = likes

    const id = itinerary?.id || itineraryList?.id
    if (!id) return

    try {
      if (!liked) {
        setLiked(!liked)
        setLikes(likes + 1)

        if (itinerary) {
          await itineraryService.like(id)
        } else if (itineraryList) {
          await itineraryListService.like(id)
        }
      } else {
        setLiked(!liked)
        setLikes(likes - 1)

        if (itinerary) {
          await itineraryService.unlike(id)
        } else if (itineraryList) {
          await itineraryListService.unlike(id)
        }
      }
    } catch {
      console.error('Error liking/unliking')
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
        <ActionIcon variant='subtle' color='gray' onClick={handleLike} w={36} size={24} p={3}>
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
