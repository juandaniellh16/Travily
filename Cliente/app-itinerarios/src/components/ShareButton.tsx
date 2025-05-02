import { ActionIcon } from '@mantine/core'
import { IoShareSocialSharp } from 'react-icons/io5'
import { Toaster, toast } from 'sonner'

export const ShareButton = ({ url }: { url?: string }) => {
  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()

    await navigator.clipboard.writeText(url ? url : window.location.href)
    toast('¡URL copiada al portapapeles!', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: '15px'
      }
    })
  }

  return (
    <>
      <ActionIcon variant='subtle' color='gray' size={24} p={3} onClick={handleCopy}>
        <IoShareSocialSharp size={16} color='black' />
      </ActionIcon>

      <Toaster position='top-center' visibleToasts={1} />
    </>
  )
}
