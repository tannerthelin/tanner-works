import { Routes, Route } from 'react-router-dom'
import Works from './pages/Works.jsx'
import Index from './pages/Index.jsx'
import About from './pages/About.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Works />} />
      <Route path="/index" element={<Index />} />
      <Route path="/about" element={<About />} />
    </Routes>
  )
}

export default App
