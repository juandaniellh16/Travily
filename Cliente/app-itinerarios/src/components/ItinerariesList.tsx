import { ItinerarySimpleType } from '@/types'
import { ItineraryCardLarge } from './ItineraryCardLarge'

interface ItinerariesListProps {
  itineraries: ItinerarySimpleType[]
  handleDelete: (id: string) => void
}

export const ItinerariesList = ({
  itineraries,
  handleDelete
}: ItinerariesListProps) => {
  return (
    <div className='flex flex-col gap-2'>
      {itineraries.map((itinerary) => (
        <ItineraryCardLarge
          key={itinerary.id}
          itinerary={itinerary}
          handleDelete={handleDelete}
        />
      ))}
    </div>
  )
}
