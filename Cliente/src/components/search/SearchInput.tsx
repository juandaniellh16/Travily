import { searchService } from '@/services/searchService'
import { Suggestion } from '@/types'
import { getLocationSubtitle, getLocationTitle } from '@/utils'
import { ActionIcon, Avatar, Combobox, ScrollArea, TextInput, useCombobox } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { useEffect, useRef, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import { FaLocationDot } from 'react-icons/fa6'
import { GoArrowRight } from 'react-icons/go'
import { useLocation, useNavigate } from 'react-router'

export const SearchInput = ({
  defaultValue,
  onlyFriends = false
}: {
  defaultValue?: string
  onlyFriends?: boolean
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState(defaultValue || '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [debounced] = useDebouncedValue(query, 200)

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption()
  })

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (document.activeElement != inputRef.current) return
      if (debounced.length < 2) {
        setSuggestions([])
        return
      }

      try {
        const results = await searchService.getSuggestions({
          query,
          lang: 'es'
        })
        setSuggestions(results)
        combobox.openDropdown()
      } catch {
        console.error('Error fetching suggestions')
      }
    }

    fetchSuggestions()
    // eslint-disable-next-line
  }, [debounced])

  const handleSearch = (suggestedQuery?: string) => {
    const localQuery = suggestedQuery || query.trim()
    if (!localQuery) return

    if (suggestedQuery) {
      setQuery(suggestedQuery)
    }

    const foundSuggestion = suggestions.find(
      (item) => item.name.toLowerCase() === localQuery.toLowerCase()
    )
    const isUserSearch = foundSuggestion?.type === 'user'

    if (isUserSearch) {
      const username = foundSuggestion.name.toLowerCase()
      navigate(`/${username}`)
    } else {
      const searchQuery = encodeURIComponent(localQuery)
      const searchType = 'itinerary'
      navigate(
        `/search?q=${searchQuery}&type=${searchType}${onlyFriends ? '&onlyFriends=true' : ''}`
      )
    }
    combobox.closeDropdown()
    inputRef.current?.blur()
  }

  return (
    <div className='w-full max-w-xs'>
      <Combobox store={combobox} onOptionSubmit={handleSearch}>
        <Combobox.Target>
          <TextInput
            ref={inputRef}
            variant='filled'
            placeholder='Buscar destinos/usuarios...'
            size='lg'
            radius='lg'
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            leftSection={<CiSearch size={20} strokeWidth={2} />}
            rightSection={
              query ? (
                <ActionIcon
                  size={32}
                  radius='xl'
                  variant='filled'
                  color='brand'
                  onClick={() => handleSearch()}
                >
                  <GoArrowRight size={18} strokeWidth={1.5} />
                </ActionIcon>
              ) : null
            }
            classNames={{
              input: 'focus:border-transparent'
            }}
          />
        </Combobox.Target>

        {suggestions.length > 0 && (
          <Combobox.Dropdown>
            <ScrollArea.Autosize type='scroll' mah={400}>
              <Combobox.Options>
                {/* Grupo de Localizaciones */}
                {!location.search.includes('type=user') &&
                  suggestions.some((item) => item.type === 'location') && (
                    <Combobox.Group label='Localizaciones'>
                      {suggestions
                        .filter((item) => item.type === 'location')
                        .slice(0, 3)
                        .map((item) => (
                          <Combobox.Option
                            key={item.geonameId}
                            value={`${getLocationTitle(item)}${
                              getLocationSubtitle(item) ? `, ${getLocationSubtitle(item)}` : ''
                            }`}
                          >
                            <span className='flex items-center gap-2'>
                              <div className='flex items-center justify-center w-6 h-6 rounded-full'>
                                <FaLocationDot size={20} color='red' />
                              </div>
                              <span className='flex flex-col'>
                                <span className='font-bold'>{getLocationTitle(item)}</span>
                                <span className='text-sm text-gray-500'>
                                  {getLocationSubtitle(item)}
                                </span>
                              </span>
                            </span>
                          </Combobox.Option>
                        ))}
                    </Combobox.Group>
                  )}

                {/* Grupo de Usuarios */}
                {!location.search.includes('type=itinerary') &&
                  suggestions.some((item) => item.type === 'user') && (
                    <Combobox.Group label='Usuarios'>
                      {suggestions
                        .filter((item) => item.type === 'user')
                        .map((item) => (
                          <Combobox.Option key={item.id} value={item.name}>
                            <span className='flex items-center gap-2'>
                              <div className='flex items-center justify-center w-6 h-6 rounded-full'>
                                <Avatar
                                  src={item.avatar || '/images/placeholder/avatar-placeholder.svg'}
                                  size={24}
                                />
                              </div>
                              {item.name}
                            </span>
                          </Combobox.Option>
                        ))}
                    </Combobox.Group>
                  )}
              </Combobox.Options>
            </ScrollArea.Autosize>
          </Combobox.Dropdown>
        )}
      </Combobox>
    </div>
  )
}
