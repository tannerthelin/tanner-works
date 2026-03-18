import Nav from '../components/Nav.jsx'
import Section from '../components/Section.jsx'
import './Index.css'

const projects = [
  { year: '2026', project: 'Leland Rebrand', status: 'Coming Soon', client: 'Leland' },
  { year: '2026', project: 'Playlogged App', status: 'Coming Soon', client: 'Personal' },
  { year: '2025', project: 'Leland Product', status: 'Coming Soon', client: 'Leland' },
  { year: '2025', project: 'Riverwoods Brand', status: 'Coming Soon', client: 'Freelance' },
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
                <td className={p.status === 'Coming Soon' ? 'status-coming-soon' : ''}>
                  {p.status}
                </td>
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
