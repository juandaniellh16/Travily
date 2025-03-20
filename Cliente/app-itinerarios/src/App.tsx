import { Routes, Route } from 'react-router-dom'
import { NotFound } from './pages/NotFound'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { MainLayout } from './layouts/MainLayout'
import { ProtectedRoute } from './components/utils/ProtectedRoute'
import { MantineProvider } from '@mantine/core'
import { Register } from './pages/Register'
import { Profile } from './pages/Profile'
import { ItineraryForm } from './pages/ItineraryForm'
import { Itinerary } from './pages/Itinerary'
import { AuthLayout } from './layouts/AuthLayout'
import { Followers } from './pages/Followers'
import { Following } from './pages/Following'
import { Connect } from './pages/Connect'
import { UserItineraries } from './pages/UserItineraries'
import { SearchResults } from './pages/SearchResults'
import { ProfileSettings } from './pages/ProfileSettings'

function App() {
  return (
    <MantineProvider
      defaultColorScheme='light'
      theme={{
        breakpoints: {
          xxs: '30rem',
          xs: '35rem',
          sm: '40rem',
          md: '48rem',
          lg: '64rem',
          lg72rem: '72rem',
          xl: '80rem'
        }
      }}
    >
      <Routes>
        <Route element={<MainLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/:username' element={<Profile />}>
            <Route path='/:username/followers' element={<Followers />} />
            <Route path='/:username/following' element={<Following />} />
          </Route>
          <Route path='/:username/itineraries' element={<UserItineraries />} />
          <Route path='/:username/favorites' element={<UserItineraries />} />
          <Route path='/itineraries/:itineraryId' element={<Itinerary />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/create-itinerary' element={<ItineraryForm />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path='/connect' element={<Connect />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path='/settings' element={<ProfileSettings />} />
          </Route>
          <Route path='/search' element={<SearchResults />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </MantineProvider>
  )
}

export default App
