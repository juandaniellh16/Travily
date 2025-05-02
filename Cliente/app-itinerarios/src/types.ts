export interface Event {
  id: string
  orderIndex: number
  label: string
  description: string
  category: EventCategory | null
  image: string | null
  startTime: string | null
  endTime: string | null
}

export type EventCategory =
  | 'landmark'
  | 'food'
  | 'accommodation'
  | 'activity'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'art'
  | 'relax'
  | 'other'

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
  location: LocationType
  isPublic: boolean
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
  location: LocationType
  isPublic: boolean
  userId: string
  likes: number
}

export interface ItineraryListType {
  id: string
  title: string
  description: string
  image: string | null
  isPublic: boolean
  userId: string
  likes: number
  itineraries: ItinerarySimpleType[]
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
  password: string
}

export interface UserWithFollowStatus extends UserPublic {
  isFollowing: boolean
}

export interface UserUpdate extends Partial<UserPrivate> {
  currentPassword?: string
  newPassword?: string
}

export interface Collaborator {
  id: string
  name: string
  username: string
}

export interface LocationType {
  geonameId: number
  name: string
  countryName?: string
  adminName1?: string
  fcode?: string
  lat?: number
  lng?: number
}

export interface LocationSuggestion extends LocationType {
  type: 'location'
  alternateNames?: { name: string; lang: string }[]
}

export interface UserSuggestion {
  type: 'user'
  id: string
  name: string
  avatar: string | null
}

export type Suggestion = LocationSuggestion | UserSuggestion
