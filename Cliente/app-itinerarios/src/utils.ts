import { IconType } from 'react-icons/lib'
import { EventCategory, LocationSuggestion } from './types'
import {
  FaBagShopping,
  FaBed,
  FaBus,
  FaLandmark,
  FaPalette,
  FaSpa,
  FaUtensils
} from 'react-icons/fa6'
import { FaHiking, FaQuestion, FaTheaterMasks } from 'react-icons/fa'

export const calculateTotalDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const diffInMs = end.getTime() - start.getTime()
  const totalDays = diffInMs / (1000 * 60 * 60 * 24)
  return Math.round(totalDays) + 1
}

/*
const defaultEventImage = [
  '/images/default/default-event-image-1.svg',
  '/images/default/default-event-image-2.svg',
  '/images/default/default-event-image-3.svg',
  '/images/default/default-event-image-4.svg',
  '/images/default/default-event-image-5.svg',
  '/images/default/default-event-image-6.svg'
]

export const getRandomEventImage = (eventId: string) => {
  if (!eventId) return defaultEventImage[0]
  const index = (parseInt(eventId, 10) * 2654435761) % defaultEventImage.length
  return defaultEventImage[Math.abs(index)]
}
*/

export const defaultAvatars = [
  '/images/default/default-avatar-1.svg',
  '/images/default/default-avatar-2.svg',
  '/images/default/default-avatar-3.svg',
  '/images/default/default-avatar-4.svg',
  '/images/default/default-avatar-5.svg',
  '/images/default/default-avatar-6.svg'
]

export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * defaultAvatars.length)
  return defaultAvatars[randomIndex]
}

export const eventCategories: EventCategory[] = [
  'landmark',
  'food',
  'accommodation',
  'activity',
  'transport',
  'entertainment',
  'shopping',
  'art',
  'relax'
]

export const categoryTranslations: Record<EventCategory, string> = {
  landmark: 'monumento',
  food: 'comida',
  accommodation: 'alojamiento',
  activity: 'actividad',
  transport: 'transporte',
  entertainment: 'ocio',
  shopping: 'compras',
  art: 'arte',
  relax: 'relajación',
  other: 'otro'
}

export const getCategoryTranslation = (category: EventCategory) => {
  return categoryTranslations[category] || categoryTranslations['other']
}

export function getCategoryIcon(category: EventCategory | null): IconType {
  switch (category) {
    case 'landmark':
      return FaLandmark
    case 'food':
      return FaUtensils
    case 'accommodation':
      return FaBed
    case 'activity':
      return FaHiking
    case 'transport':
      return FaBus
    case 'entertainment':
      return FaTheaterMasks
    case 'shopping':
      return FaBagShopping
    case 'art':
      return FaPalette
    case 'relax':
      return FaSpa
    default:
      return FaQuestion
  }
}

export function getCategoryImage(category: EventCategory | null): string | null {
  switch (category) {
    case 'landmark':
      return '/images/event-categories/landmark.svg'
    case 'food':
      return '/images/event-categories/food.svg'
    case 'accommodation':
      return '/images/event-categories/accommodation.svg'
    case 'activity':
      return '/images/event-categories/activity.svg'
    case 'transport':
      return '/images/event-categories/transport.svg'
    case 'entertainment':
      return '/images/event-categories/entertainment.svg'
    case 'shopping':
      return '/images/event-categories/shopping.svg'
    case 'art':
      return '/images/event-categories/art.svg'
    case 'relax':
      return '/images/event-categories/relax.svg'
    default:
      return null
  }
}

export const getSpanishName = (alternateNames: { name: string; lang: string }[]) => {
  return alternateNames.find((alt) => alt.lang === 'es')?.name
}

const adm2Labels: Record<string, string> = {
  España: 'Provincia',
  Italia: 'Provincia',
  Francia: 'Departamento',
  'Reino Unido': 'Condado',
  Alemania: 'Distrito',
  'Estados Unidos': 'Condado',
  México: 'Municipio',
  Argentina: 'Departamento',
  Brasil: 'Municipio'
}

export const getLocationTitle = (location: LocationSuggestion) => {
  if (location.fcode === 'ADM1') {
    return location.name
  }

  if (location.fcode === 'ADM2') {
    const label = location.countryName
      ? adm2Labels[location.countryName] || 'División administrativa'
      : 'División administrativa'
    return `${location.name} (${label})`
  }

  return location.name
}

export const getLocationSubtitle = (location: LocationSuggestion) => {
  // Si fcode es 'PCLI' (país), no mostramos nada
  if (location.fcode === 'PCLI') {
    return ''
  }

  // Si fcode es 'ADM1', solo mostramos el nombre del país
  if (location.fcode === 'ADM1') {
    return location.countryName || ''
  }

  // En cualquier otro caso, mostramos adminName1 - countryName
  const adminName1 = location.adminName1 || ''
  const countryName = location.countryName || ''

  return `${
    adminName1 && countryName ? adminName1 + ', ' + countryName : adminName1 || countryName
  }`
}
