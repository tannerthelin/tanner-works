import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { TextMorph } from 'torph/react'
import AnimatedGoal from './AnimatedGoal'
import BlurInText from './BlurInText'
import logo from '../../assets/html-mockups/leland-mockup/svg/logo.svg'
import chevronDown from '../../assets/html-mockups/leland-mockup/svg/chevron-down.svg'
import arrowIcon from '../../assets/html-mockups/leland-mockup/svg/arrow.svg'
import arrowDiagonal from '../../assets/html-mockups/leland-mockup/svg/arrow-diagonal.svg'
import bg1 from '../../assets/html-mockups/leland-mockup/images/Image-1.png'
import bg2 from '../../assets/html-mockups/leland-mockup/images/Image-2.png'
import bg3 from '../../assets/html-mockups/leland-mockup/images/Image-3.png'
import bg4 from '../../assets/html-mockups/leland-mockup/images/Image-4.png'
import './LelandMockup.css'

const SLIDES = [
  {
    image: bg1,
    headline: 'Reach your most\nambitious goals',
    name: 'Charlotte',
    caption: 'Admitted to Stanford',
  },
  {
    image: bg2,
    headline: 'Reach your most\nambitious goals',
    name: 'Marcus',
    caption: 'Offer at Meta',
  },
  {
    image: bg3,
    headline: 'Reach your most\nambitious goals',
    name: 'Brooke',
    caption: 'Admitted to Johns Hopkins',
  },
  {
    image: bg4,
    headline: 'Reach your most\nambitious goals',
    name: 'Paul',
    caption: 'Scaled his business with AI',
  },
]

const INTERVAL = 4000

const GOALS = [
  'get an MBA',
  'learn AI',
  'break into Product Management',
  'build a business',
  'ace the GMAT',
  'land a consulting offer',
  'switch careers',
]

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%' }),
  center: { x: '0%' },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%' }),
}

const imgParallax = {
  enter: (dir) => ({ x: dir > 0 ? '-25%' : '25%' }),
  center: { x: '0%' },
  exit: (dir) => ({ x: dir > 0 ? '25%' : '-25%' }),
}

const SLIDE_TRANSITION = { duration: 1.3, ease: [0.76, 0, 0.24, 1] }

export default function LelandMockup() {
  const [current, setCurrent] = useState(0)
  const [captionIndex, setCaptionIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const captionTimerRef = useRef(null)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, INTERVAL)
  }, [])

  const handleSearchBarClick = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const goTo = useCallback((index) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }, [current])

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % SLIDES.length)
    resetTimer()
  }, [resetTimer])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
    resetTimer()
  }, [resetTimer])

  useEffect(() => {
    resetTimer()
    return () => clearInterval(timerRef.current)
  }, [resetTimer])

  // Delay caption text change by 0.75s after slide change
  useEffect(() => {
    if (captionTimerRef.current) clearTimeout(captionTimerRef.current)
    captionTimerRef.current = setTimeout(() => {
      setCaptionIndex(current)
    }, 750)
    return () => clearTimeout(captionTimerRef.current)
  }, [current])

  // Preload all slide images on mount to avoid decode hitches during animation
  useEffect(() => {
    SLIDES.forEach(({ image }) => {
      const img = new Image()
      img.src = image
    })
  }, [])

  const slide = SLIDES[current]

  return (
    <div className="lm-root">
      <div className="lm-page">
          {/* Hero Section */}
          <div className="lm-hero">
            {/* Background Images */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 1, ease: 'easeOut' }}
            >
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={current}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={SLIDE_TRANSITION}
                  className="lm-hero-bg"
                >
                  <motion.img
                    src={slide.image}
                    alt=""
                    custom={direction}
                    variants={imgParallax}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={SLIDE_TRANSITION}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="lm-hero-overlay" />
            </motion.div>

            {/* Nav */}
            <motion.nav
              className="lm-nav"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.45, ease: 'easeOut' }}
            >
              <div className="lm-nav-left">
                <img src={logo} alt="Leland" className="lm-logo" />
                <div className="lm-nav-links">
                  <a href="#">Categories <img src={chevronDown} alt="" className="lm-chevron" /></a>
                  <a href="#">Reviews</a>
                  <a href="#">Become a coach</a>
                </div>
              </div>
              <div className="lm-nav-right">
                <a href="#" className="lm-login-link">Log In</a>
                <a href="#" className="lm-cta-btn">Get Started</a>
              </div>
            </motion.nav>

            {/* Hero Content */}
            <div className="lm-hero-content">
              <div className="lm-hero-text">
                <BlurInText text={slide.headline} delay={1.45} />
                <motion.p
                  className="lm-subtitle"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.55, duration: 0.45, ease: 'easeOut' }}
                >
                  Coaching, courses, and events from thousands of experts.
                </motion.p>
                <motion.div
                  className="lm-search-bar"
                  onClick={handleSearchBarClick}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.65, duration: 0.45, ease: 'easeOut' }}
                >
                  <div className="lm-search-inner">
                    <span className={`lm-search-label ${searchFocused || searchValue ? 'lm-search-label--focused' : ''}`}>
                      I want to
                    </span>
                    <div className="lm-search-input-area lm-search-input-area--visible">
                      {searchValue === '' && (
                        <AnimatedGoal
                          goals={GOALS}
                          className={`lm-search-goal-placeholder ${searchFocused || searchValue ? '' : 'lm-search-goal-placeholder--unfocused'}`}
                        />
                      )}
                      <input
                        ref={inputRef}
                        type="text"
                        className="lm-search-input"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                      />
                    </div>
                  </div>
                  <button className="lm-search-btn">
                    <img src={arrowIcon} alt="" className="lm-search-btn-icon" />
                  </button>
                </motion.div>
                <motion.div
                  className="lm-category-pills"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.75, duration: 0.45, ease: 'easeOut' }}
                >
                  <span className="lm-pill">MBA</span>
                  <span className="lm-pill">AI</span>
                  <span className="lm-pill">Product Management</span>
                  <span className="lm-pill">GMAT</span>
                  <span className="lm-pill lm-pill-plain">+68 more</span>
                </motion.div>
              </div>
            </div>

            {/* Bottom bar */}
            <motion.div
              className="lm-hero-bottom"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.45, ease: 'easeOut' }}
            >
              <div className="lm-carousel-controls">
                <button className="lm-arrow-btn" onClick={prev}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <div className="lm-arrow-btn-wrap">
                  <svg className="lm-progress-ring" viewBox="0 0 52 52">
                    <circle
                      key={current}
                      className="lm-progress-ring__circle"
                      cx="26"
                      cy="26"
                      r="24"
                      style={{ animationDuration: `${INTERVAL}ms` }}
                    />
                  </svg>
                  <button className="lm-arrow-btn" onClick={next}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="lm-person-caption">
                <TextMorph>{SLIDES[captionIndex].name}</TextMorph><span style={{ opacity: 0.4 }}> · </span><TextMorph>{SLIDES[captionIndex].caption}</TextMorph>
                <img src={arrowDiagonal} alt="" className="lm-arrow-diagonal" />
              </div>
            </motion.div>
          </div>
        </div>
    </div>
  )
}
