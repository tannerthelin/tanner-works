import { NavLink, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import Section from './Section.jsx'
import sunIcon from '../assets/icons/sun.svg'
import moonIcon from '../assets/icons/moon.svg'
import airplaneIcon from '../assets/icons/airplane.svg'
import './Nav.css'

function Nav() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <Link to="/" className="nav-link">
          Tanner Thelin
        </Link>
      </div>
      <div className="nav-center">
        <NavLink to="/work" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Work
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          About
        </NavLink>
      </div>
      <div className="nav-icon-buttons">
        <button className="nav-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
          <img src={theme === 'light' ? sunIcon : moonIcon} alt="" className="theme-icon" />
        </button>
        <a className="nav-icon-btn" href="https://www.linkedin.com/in/tanner-thelin/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <img src={airplaneIcon} alt="" className="theme-icon" />
        </a>
      </div>
    </nav>
  )
}

export default Nav
