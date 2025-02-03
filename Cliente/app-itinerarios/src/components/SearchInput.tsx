import { ActionIcon, TextInput } from '@mantine/core'
import { useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import { GoArrowRight } from 'react-icons/go'

export const SearchInput = () => {
  const [query, setQuery] = useState('')

  return (
    <TextInput
      variant='filled'
      placeholder='Introduce un destino...'
      size='lg'
      radius='lg'
      value={query}
      onChange={(e) => setQuery(e.currentTarget.value)}
      leftSection={<CiSearch size={20} strokeWidth={2} />}
      rightSection={
        query ? (
          <ActionIcon
            size={32}
            radius='xl'
            variant='filled'
            onClick={() => setQuery('')}
          >
            <GoArrowRight size={18} strokeWidth={1.5} />
          </ActionIcon>
        ) : null
      }
    />
  )
}
