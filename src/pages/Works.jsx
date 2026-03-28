import Nav from '../components/Nav.jsx'
import Section from '../components/Section.jsx'
import './Works.css'

const images = Object.entries(
  import.meta.glob('../assets/works-img/*', { eager: true, import: 'default' })
).map(([path, src]) => ({
  src,
  name: path.split('/').pop().replace(/\.[^.]+$/, ''),
}))

function Works() {
  return (
    <div className="page">
      <Nav />

      <section className="hero-centered">
        <div className="headline">
          <p>
            Tanner is a Product Designer in Salt Lake City. Currently Head of Design at{' '}
            <a href="https://www.joinleland.com" className="headline-link" target="_blank" rel="noopener noreferrer">
              Leland
            </a>.
          </p>
        </div>
      </section>

      <section className="works-grid">
        <div className="grid">
          {images.map((img) => (
            <div className="grid-item" key={img.name}>
              <img src={img.src} alt={img.name} className="grid-image" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Works
