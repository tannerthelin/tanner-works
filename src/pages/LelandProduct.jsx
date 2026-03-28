import Nav from '../components/Nav.jsx'
import Section from '../components/Section.jsx'
import './LelandProduct.css'

const images = Object.entries(
  import.meta.glob('../assets/projects/leland-product/*.{png,jpg,jpeg,webp}', { eager: true, import: 'default' })
).map(([path, src]) => ({
  src,
  name: path.split('/').pop().replace(/\.[^.]+$/, ''),
}))

function LelandProduct() {
  return (
    <div className="page">
      <Nav />

      <Section
        className="hero-section"
        left={null}
        right={
          <div className="headline">
            <p>
              Leland Product — design work for the coaching marketplace platform, 2025.
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

export default LelandProduct
