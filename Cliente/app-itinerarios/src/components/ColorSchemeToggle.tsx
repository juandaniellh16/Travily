import { LuSunMedium } from 'react-icons/lu'
import { IoMoonOutline } from 'react-icons/io5'
import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme
} from '@mantine/core'

export const ColorSchemeToggle = () => {
  const { setColorScheme } = useMantineColorScheme()
  const computedColorScheme = useComputedColorScheme('light', {
    getInitialValueInEffect: true
  })

  return (
    <ActionIcon
      onClick={() =>
        setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')
      }
      variant='default'
      size='lg'
      radius='md'
      aria-label='Cambiar tema de color'
    >
      {computedColorScheme === 'light' ? (
        <IoMoonOutline size='20' strokeWidth={1.5} />
      ) : (
        <LuSunMedium size='20' strokeWidth={1.5} />
      )}
    </ActionIcon>
  )
}
