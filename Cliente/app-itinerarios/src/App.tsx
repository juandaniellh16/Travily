import { Routes, Route } from 'react-router-dom'
import { NotFound } from './pages/NotFound'
import { Home } from './pages/Home'
import { Layout } from './layouts/Layout'
import { MantineProvider } from '@mantine/core'

function App() {
  return (
    <MantineProvider defaultColorScheme='light'>
      <Routes>
        <Route element={<Layout />}>
          <Route path='/' element={<Home />} />
          <Route path='/login' />
          <Route path='/register' />
          <Route path='/profile' />
          <Route path='/profile/:userId' />
          <Route path='/itinerary/:itineraryId' />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </MantineProvider>
  )
}

export default App
