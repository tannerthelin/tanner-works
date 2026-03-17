import './Section.css'

function Section({ left, right, className = '' }) {
  return (
    <div className={`section ${className}`}>
      <div className="col-left">{left}</div>
      <div className="col-right">{right}</div>
    </div>
  )
}

export default Section
