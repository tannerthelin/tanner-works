import './ScrollIndicator.css'

function ScrollIndicator() {
  const handleClick = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <button className="scroll-indicator" aria-label="Scroll down" onClick={handleClick}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 3V13M8 13L3 8M8 13L13 8"
          stroke="var(--color-bg)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default ScrollIndicator
