import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import Section from '../components/Section.jsx'
import claudeIcon from '../assets/claude.svg'
import './Index.css'

const projects = [
  { year: '2026', project: 'Leland Rebrand', status: 'Coming Soon', client: 'Leland' },
  { year: '2026', project: 'Playlogged App', link: '/playlogged', client: 'Personal', ai: true },
  { year: '2025', project: 'Leland Product', link: '/leland-product', client: 'Leland' },
  { year: '2025', project: 'Riverwoods Brand', status: 'Coming Soon', client: 'Freelance' },
  { year: '2024', project: 'Titan Product', status: 'Coming Soon', client: 'Freelance' },
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
                <td>
                  {p.link ? <Link to={p.link}>{p.project}</Link> : p.project}
                  {p.ai && <img src={claudeIcon} alt="Built with AI" className="claude-icon" />}
                </td>
                <td className={p.status === 'Coming Soon' ? 'status-coming-soon' : ''}>
                  {p.link ? <Link to={p.link}>View</Link> : p.status}
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
