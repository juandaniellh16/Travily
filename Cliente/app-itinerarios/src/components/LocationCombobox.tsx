import {
  Combobox,
  useCombobox,
  ComboboxTarget,
  ComboboxDropdown,
  ComboboxOption
} from '@mantine/core'
import { TextInput } from '@mantine/core'
import { useState, useEffect, useRef } from 'react'
import { useDebouncedValue } from '@mantine/hooks'
import { searchService } from '@/services/searchService'
import { LocationSuggestion } from '@/types'
import { getLocationSubtitle, getLocationTitle } from '@/utils'
import { FaLocationDot } from 'react-icons/fa6'

export function LocationCombobox({
  onLocationSelect
}: {
  onLocationSelect: (location: LocationSuggestion | null) => void
}) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
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
        const results = await searchService.getLocationSuggestions({
          query,
          lang: 'es'
        })
        setSuggestions(results)
        combobox.openDropdown()
      } catch {
        console.error('Error fetching location suggestions')
      }
    }

    fetchSuggestions()
    // eslint-disable-next-line
  }, [debounced])

  useEffect(() => {
    if (query === '') {
      onLocationSelect(null)
    }
  }, [query, onLocationSelect])

  return (
    <Combobox store={combobox} onOptionSubmit={(val) => setQuery(val)}>
      <ComboboxTarget>
        <TextInput
          ref={inputRef}
          label='¿A dónde quieres ir?'
          placeholder='Edimburgo, Glasgow...'
          size='md'
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      </ComboboxTarget>

      {query.length > 1 && (
        <ComboboxDropdown>
          {suggestions.length === 0 ? (
            <ComboboxOption value='no-results' disabled>
              No se encontraron resultados
            </ComboboxOption>
          ) : (
            suggestions.map((location) => (
              <ComboboxOption
                key={location.geonameId}
                value={`${getLocationTitle(location)}${
                  getLocationSubtitle(location) ? `, ${getLocationSubtitle(location)}` : ''
                }`}
                onClick={() => {
                  combobox.closeDropdown()
                  inputRef.current?.blur()
                  onLocationSelect(location)
                }}
              >
                <span className='flex items-center gap-2'>
                  <div className='flex items-center justify-center w-6 h-6 rounded-full'>
                    <FaLocationDot size={20} color='red' />
                  </div>
                  <span className='flex flex-col'>
                    <span className='font-bold'>{getLocationTitle(location)}</span>
                    <span className='text-sm text-gray-500'>{getLocationSubtitle(location)}</span>
                  </span>
                </span>
              </ComboboxOption>
            ))
          )}
        </ComboboxDropdown>
      )}
    </Combobox>
  )
}
