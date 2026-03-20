import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Prototype from './pages/Prototype'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/prototype" element={<Prototype />} />
      </Routes>
    </BrowserRouter>
  )
}
