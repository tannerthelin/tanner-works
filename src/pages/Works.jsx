import Nav from '../components/Nav.jsx'
import Section from '../components/Section.jsx'
import './Works.css'
import playloggedLogo from '../assets/html-mockups/playlogged-mockup/playlogged-logo.svg'
import dotsMenuIcon from '../assets/icons/dots-menu.svg'
import trueinsightVideo from '../assets/html-mockups/trueinsight/cropped.mov'

const images = Object.entries(
  import.meta.glob('../assets/works-img/*.{png,jpg,jpeg,gif,webp,svg}', { eager: true, import: 'default' })
).map(([path, src]) => ({
  src,
  name: path.split('/').pop().replace(/\.[^.]+$/, ''),
})).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

const gameImages = Object.entries(
  import.meta.glob('../assets/html-mockups/playlogged-mockup/game-images/*', { eager: true, import: 'default' })
).map(([path, src]) => ({
  src,
  name: path.split('/').pop().replace(/\.[^.]+$/, ''),
}))

// Split game images into 7 rows for ticker animation
const ROWS = 7
const imagesPerRow = Math.ceil(gameImages.length / ROWS)
const tickerRows = Array.from({ length: ROWS }, (_, i) => {
  const start = i * imagesPerRow
  const row = gameImages.slice(start, start + imagesPerRow)
  // Repeat to ensure enough images for seamless scrolling
  return [...row, ...row, ...row, ...row]
})

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
          {images.slice(0, 4).map((img) => (
            <div className="grid-item" key={img.name}>
              <img src={img.src} alt={img.name} className="grid-image" />
            </div>
          ))}

          <div className="grid-item">
            <div className="featured-work">
              <div className="featured-work-inner">
                <div className="pl-ticker-container">
                  {tickerRows.map((row, rowIndex) => (
                    <div className="pl-ticker-row" key={rowIndex}>
                      <div className={`pl-ticker-track ${rowIndex % 2 === 0 ? 'pl-scroll-left' : 'pl-scroll-right'}`}>
                        {row.map((img, i) => (
                          <img src={img.src} alt={img.name} className="pl-game-cover" key={i} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pl-vignette" />
                <img src={playloggedLogo} alt="Playlogged" className="pl-logo" />
                <div className="pl-buttons">
                  <button className="pl-btn pl-btn-ghost">Log in</button>
                  <button className="pl-btn">Join</button>
                </div>
                <img src={dotsMenuIcon} alt="" className="pl-dots-menu" />
              </div>
            </div>
          </div>

          {images.slice(4, 8).map((img) => (
            <div className="grid-item" key={img.name}>
              <img src={img.src} alt={img.name} className="grid-image" />
            </div>
          ))}

          <div className="grid-item">
            <div className="featured-work">
              <div className="featured-work-inner ti-inner">
                <video
                  src={trueinsightVideo}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="ti-video"
                />
              </div>
            </div>
          </div>

          {images.slice(8).map((img) => (
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
