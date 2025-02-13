const defaultEventImage = [
  '/images/default-event-image-1.svg',
  '/images/default-event-image-2.svg',
  '/images/default-event-image-3.svg',
  '/images/default-event-image-4.svg',
  '/images/default-event-image-5.svg',
  '/images/default-event-image-6.svg'
]

export const getRandomEventImage = (eventId: string) => {
  if (!eventId) return defaultEventImage[0]
  const index = (parseInt(eventId, 10) * 2654435761) % defaultEventImage.length
  return defaultEventImage[Math.abs(index)]
}

const defaultAvatar = [
  '/images/default-avatar-1.svg',
  '/images/default-avatar-2.svg',
  '/images/default-avatar-3.svg',
  '/images/default-avatar-4.svg',
  '/images/default-avatar-5.svg',
  '/images/default-avatar-6.svg'
]

export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * defaultAvatar.length)
  return defaultAvatar[randomIndex]
}
