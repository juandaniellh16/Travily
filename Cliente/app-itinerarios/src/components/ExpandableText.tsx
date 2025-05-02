import { Group, Text } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { useState } from 'react'

export const ExpandableText = ({
  text,
  lines,
  fw = 500,
  lh = 1.5,
  c = 'black',
  size
}: {
  text: string
  lines: number
  fw?: number
  lh?: number
  c?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
}) => {
  const [opened, setOpened] = useState(false)

  const isMobile = useMediaQuery('(min-width: 640)')

  const fontSize = size
    ? typeof size === 'number'
      ? `${size}px`
      : size
    : isMobile
      ? 'md'
      : '14.5px'

  return (
    <Group onClick={() => setOpened((prev) => !prev)}>
      <Text size={fontSize} c={c} fw={fw} lh={lh} lineClamp={opened ? undefined : lines}>
        {text}
      </Text>
    </Group>
  )
}
