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

      <Section
        className="hero-section"
        left={null}
        right={
          <div className="headline">
            <p>
              Design generalist with a background in agencies & early-stage startups. Currently Head of Design at{' '}
              <a href="https://www.joinleland.com" className="headline-link" target="_blank" rel="noopener noreferrer">
                Leland
              </a>.
            </p>
          </div>
        }
      />

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
