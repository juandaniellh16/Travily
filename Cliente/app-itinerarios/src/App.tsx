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

function App() {
  return (
    <MantineProvider defaultColorScheme='light'>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/profile/:userId' element={<Profile />} />
          <Route path='/itinerary/:itineraryId' element={<Itinerary />} />
          <Route element={<ProtectedRoute />}>
            <Route path='/create-itinerary' element={<ItineraryForm />} />
          </Route>
        </Route>
        <Route element={<AuthLayout />}>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </MantineProvider>
  )
}

export default App
