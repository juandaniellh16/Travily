import { Routes, Route } from 'react-router-dom'
import { NotFound } from './pages/NotFound'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Layout } from './layouts/Layout'
import { ProtectedRoute } from './components/utils/ProtectedRoute'
import { MantineProvider } from '@mantine/core'
import { Register } from './pages/Register'

function App() {
  return (
    <MantineProvider defaultColorScheme='light'>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/profile' />
          <Route path='/profile/:userId' />
          <Route path='/itinerary/:itineraryId' />
          <Route element={<ProtectedRoute />}>
            <Route path='/create-itinerary' />
          </Route>
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </MantineProvider>
  )
}

export default App
