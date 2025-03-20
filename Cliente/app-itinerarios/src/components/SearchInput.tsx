import { searchService } from '@/services/searchService'
import {
  ActionIcon,
  Combobox,
  ScrollArea,
  TextInput,
  useCombobox
} from '@mantine/core'
import { useEffect, useRef, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import { GoArrowRight } from 'react-icons/go'
import { useNavigate } from 'react-router-dom'

export const SearchInput = ({ defaultValue }: { defaultValue?: string }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState(defaultValue || '')
  const [suggestions, setSuggestions] = useState<
    { type: 'location' | 'user'; name: string }[]
  >([])

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption()
  })

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (document.activeElement != inputRef.current) return
      if (query.length < 2) return setSuggestions([])

      try {
        const results = await searchService.getSuggestions(query)
        setSuggestions(results)
        combobox.openDropdown()
      } catch {
        console.error('Error fetching suggestions')
      }
    }

    fetchSuggestions()
    // eslint-disable-next-line
  }, [query])

  const handleSearch = (suggestedQuery?: string) => {
    const localQuery = suggestedQuery || query.trim()
    if (!localQuery) return

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
      navigate(`/search?q=${searchQuery}&type=${searchType}`)
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
                  color='teal'
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
            <ScrollArea.Autosize type='scroll' mah={200}>
              <Combobox.Options>
                {/* Grupo de Localizaciones */}
                {suggestions.some((item) => item.type === 'location') && (
                  <Combobox.Group label='Localizaciones'>
                    {suggestions
                      .filter((item) => item.type === 'location')
                      .map((item) => (
                        <Combobox.Option key={item.name} value={item.name}>
                          📍 {item.name}
                        </Combobox.Option>
                      ))}
                  </Combobox.Group>
                )}

                {/* Grupo de Usuarios */}
                {suggestions.some((item) => item.type === 'user') && (
                  <Combobox.Group label='Usuarios'>
                    {suggestions
                      .filter((item) => item.type === 'user')
                      .map((item) => (
                        <Combobox.Option key={item.name} value={item.name}>
                          👤 {item.name}
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
