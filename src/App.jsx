import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Landing2 from './pages/Landing2'
import Prototype from './pages/Prototype'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/v2" element={<Landing2 />} />
        <Route path="/prototype" element={<Prototype />} />
      </Routes>
    </BrowserRouter>
  )
}
