import { SegmentedControl } from '@mantine/core'
import { useLocation, useNavigate, useParams } from 'react-router'

export const FollowersFollowingTabs = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { username } = useParams()

  const activeTab: 'Siguiendo' | 'Seguidores' = location.pathname.includes('followers')
    ? 'Seguidores'
    : 'Siguiendo'

  return (
    <div className='sticky top-0 z-10 items-center justify-center w-full max-w-md gap-4 mx-auto'>
      <SegmentedControl
        radius='md'
        w='100%'
        size='sm'
        value={activeTab}
        onChange={(value) =>
          navigate(value === 'Siguiendo' ? `/${username}/following` : `/${username}/followers`, {
            state: { fromProfile: true }
          })
        }
        data={['Siguiendo', 'Seguidores']}
        withItemsBorders={false}
      />
    </div>
  )
}
