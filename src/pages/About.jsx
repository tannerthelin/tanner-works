import Nav from '../components/Nav.jsx'
import Section from '../components/Section.jsx'
import './About.css'

function About() {
  return (
    <div className="page">
      <Nav />

      <Section
        className="hero-section"
        left={null}
        right={
          <div className="headline">
            <p>
              Design generalist with a background in agencies & early-stage startups.
              I'm a tinkerer at heart and enjoy building highly polished products.
              Living in Salt Lake City and occasionally New York.
              <br /><br />
              I'm currently Head of Design at <a href="https://www.joinleland.com" className="headline-link" target="_blank" rel="noopener noreferrer">Leland</a>, where we're building the future
              of sharing expertise online.
              <br /><br />
              I also co-founded <a href="#" className="headline-link">Mondays</a>, a full-service design studio where we built
              brands and web experiences.
              <br /><br />
              You can reach me at <a href="https://x.com/tannerthelin" className="headline-link" target="_blank" rel="noopener noreferrer">@tannerthelin</a> or <a href="mailto:tannerthelin@gmail.com" className="headline-link">tannerthelin@gmail.com</a>
            </p>
          </div>
        }
      />

    </div>
  )
}

export default About
