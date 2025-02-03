interface Event {
  id: string
  label: string
  description: string
  image: string | null
  content: string
}

interface Day {
  id: string
  label: string
  day_number: number
  events: Event[]
}

export interface ItineraryType {
  id: string
  title: string
  description: string
  image: string | null
  start_date: string
  end_date: string
  locations: string[]
  user_id: string
  likes: number
  days: Day[]
}

export interface ItinerarySimpleType {
  id: string
  title: string
  description: string
  image: string | null
  start_date: string
  end_date: string
  locations: string[]
  user_id: string
  likes: number
}

export interface User {
  id: string
  name: string
  username: string
  email: string
  avatar: string | null
  followers: number
  following: number
}
