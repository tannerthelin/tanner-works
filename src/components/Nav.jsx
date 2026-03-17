import { NavLink, Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import Section from './Section.jsx'
import sunIcon from '../assets/icons/sun.svg'
import moonIcon from '../assets/icons/moon.svg'
import './Nav.css'

function Nav() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Section
      className="nav-section"
      left={
        <nav className="nav-left">
          <Link to="/" className="nav-link">
            Tanner Thelin
          </Link>
        </nav>
      }
      right={
        <div className="nav-right-wrapper">
          <nav className="nav-right">
            <NavLink to="/index" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Works
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              About
            </NavLink>
          </nav>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            <img src={theme === 'light' ? sunIcon : moonIcon} alt="" className="theme-icon" />
          </button>
        </div>
      }
    />
  )
}

export default Nav
