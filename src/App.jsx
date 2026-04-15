import { Routes, Route } from 'react-router-dom'
import Works from './pages/Works.jsx'
import Index from './pages/Index.jsx'
import About from './pages/About.jsx'
import LelandProduct from './pages/LelandProduct.jsx'
import Playlogged from './pages/Playlogged.jsx'
import Edit from './pages/Edit.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Works />} />
      <Route path="/work" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/leland-product" element={<LelandProduct />} />
      <Route path="/playlogged" element={<Playlogged />} />
      <Route path="/edit" element={<Edit />} />
    </Routes>
  )
}

export default App
