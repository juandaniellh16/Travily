import { ItineraryListType } from '@/types'
import { ItineraryListCard } from './ItineraryListCard'

interface ItineraryListsListProps {
  lists: ItineraryListType[]
  handleDelete: (id: string) => void
}

export const ItineraryListsList = ({ lists, handleDelete }: ItineraryListsListProps) => {
  return (
    <div className='flex flex-col gap-2'>
      {lists.map((list) => (
        <ItineraryListCard key={list.id} list={list} handleDelete={handleDelete} />
      ))}
    </div>
  )
}
