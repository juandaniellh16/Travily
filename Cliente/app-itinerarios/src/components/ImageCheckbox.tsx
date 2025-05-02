import { Checkbox, Text, Image } from '@mantine/core'
import { useUncontrolled } from '@mantine/hooks'

interface ImageCheckboxProps {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  label: string
  image: string
}

export const ImageCheckbox = ({
  checked,
  defaultChecked,
  onChange,
  label,
  image
}: ImageCheckboxProps) => {
  const [value, handleChange] = useUncontrolled({
    value: checked,
    defaultValue: defaultChecked,
    finalValue: false,
    onChange
  })

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        handleChange(!value)
      }}
      data-checked={value || undefined}
      className={`flex items-center rounded-sm py-1.5 px-2.5 w-full border transition-colors
        ${
          value
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800'
        }
      `}
    >
      <Image src={image} alt={label} w={40} h={40} radius='xl' />

      <div className='flex-1 ml-3 text-left '>
        <Text fw={500} lh={1} size='sm' className='text-gray-900 dark:text-gray-100'>
          {label}
        </Text>
      </div>

      <Checkbox
        checked={value}
        onChange={() => handleChange(!value)}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        styles={{ input: { cursor: 'pointer' } }}
      />
    </button>
  )
}
