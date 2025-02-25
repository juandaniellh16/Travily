export interface Event {
  id: string
  orderIndex: number
  label: string
  description: string
  image: string | null
  content: string
}

export interface Day {
  id: string
  label: string
  dayNumber: number
  events: Event[]
}

export interface ItineraryType {
  id: string
  title: string
  description: string
  image: string | null
  startDate: string
  endDate: string
  locations: string[]
  userId: string
  likes: number
  days: Day[]
}

export interface ItinerarySimpleType {
  id: string
  title: string
  description: string
  image: string | null
  startDate: string
  endDate: string
  locations: string[]
  userId: string
  likes: number
}

export interface UserPublic {
  id: string
  name: string
  username: string
  avatar: string | null
  followers: number
  following: number
}

export interface UserPrivate extends UserPublic {
  email: string
}

export interface UserWithFollowStatus extends UserPublic {
  isFollowing: boolean
}

export interface Collaborator {
  id: string
  name: string
  username: string
}
