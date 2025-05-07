import { SegmentedControl } from '@mantine/core'
import { useLocation, useNavigate, useParams } from 'react-router'

export const FollowersFollowingTabs = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { username } = useParams()

  const activeTab: 'Seguidores' | 'Siguiendo' = location.pathname.includes('following')
    ? 'Siguiendo'
    : 'Seguidores'

  return (
    <div className='sticky top-0 z-10 items-center justify-center w-full max-w-md gap-4 mx-auto'>
      <SegmentedControl
        radius='md'
        w='100%'
        size='sm'
        value={activeTab}
        onChange={(value) =>
          navigate(value === 'Seguidores' ? `/${username}/followers` : `/${username}/following`, {
            state: { fromProfile: true }
          })
        }
        data={['Seguidores', 'Siguiendo']}
        withItemsBorders={false}
      />
    </div>
  )
}
