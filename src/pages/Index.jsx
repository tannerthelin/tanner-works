import Nav from '../components/Nav.jsx'
import Section from '../components/Section.jsx'
import './Index.css'

const projects = [
  { year: '2025', project: 'Brand Refresh', role: 'Design Lead', client: 'Linear' },
  { year: '2024', project: 'Marketing Site', role: 'Designer', client: 'Linear' },
  { year: '2024', project: 'Product Design System', role: 'Design Lead', client: 'Linear' },
  { year: '2023', project: 'Mobile App', role: 'Designer', client: 'Personal' },
  { year: '2022', project: 'Dashboard UI', role: 'Designer', client: 'Freelance' },
  { year: '2021', project: 'Identity System', role: 'Art Director', client: 'Studio' },
  { year: '2020', project: 'Portfolio Site', role: 'Designer & Developer', client: 'Personal' },
]

function Index() {
  return (
    <div className="page">
      <Nav />

      <Section
        className="hero-section"
        left={null}
        right={
          <div className="headline">
            <p>A chronological index of selected projects, 2020 – present.</p>
          </div>
        }
      />

      <section className="index-list">
        <table className="project-table">
          <tbody>
            {projects.map((p, i) => (
              <tr key={i}>
                <td>{p.year}</td>
                <td>{p.project}</td>
                <td>{p.role}</td>
                <td>{p.client}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default Index
