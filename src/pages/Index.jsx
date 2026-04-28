import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import useDragScroll from '../hooks/useDragScroll.js'
import claudeIcon from '../assets/claude.svg'
import './Index.css'

function ScrollGallery({ images }) {
  const scrollRef = useDragScroll()
  return (
    <div className="work-project-images">
      <div className="work-project-scroll" ref={scrollRef}>
        {images.map((img, j) => (
          <div key={j} className="work-image-card">
            <div className="work-image-placeholder">
              {img.src ? (
                <img src={img.src} alt={img.label} draggable={false} />
              ) : null}
            </div>
            <span className="work-image-label">{img.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Index() {
  const [projects, setProjects] = useState(null)

  useEffect(() => {
    fetch(`/data/projects.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(setProjects)
      .catch(() => setProjects([]))
  }, [])

  if (!projects) {
    return (
      <div className="page">
        <Nav />
      </div>
    )
  }

  return (
    <div className="page">
      <Nav />

      <header className="work-header">
        <div className="headline">
          <p>
            Tanner is a Design Engineer in Salt Lake City. Currently Head of Design at{' '}
            <a href="https://www.joinleland.com" className="headline-link" target="_blank" rel="noopener noreferrer">
              Leland
            </a>.
          </p>
        </div>
      </header>

      <div className="work-projects">
        {projects.map((project, i) => (
          <section key={project.id || i} className="work-project">
            <div className="work-project-info">
              <div className="work-project-meta">
                <span>{project.year}</span>
                <span>{project.client}</span>
              </div>
              <h2 className="work-project-title">
                {project.title}
                {project.ai && <img src={claudeIcon} alt="Built with AI" className="claude-icon" />}
              </h2>
              <p className="work-project-desc">{project.description}</p>
              {project.link ? (
                <Link to={project.link} className="work-project-link">
                  View case study
                </Link>
              ) : project.status ? (
                <span className="work-project-status">{project.status}</span>
              ) : null}
            </div>

            <ScrollGallery images={project.images} />
          </section>
        ))}
      </div>
    </div>
  )
}

export default Index
