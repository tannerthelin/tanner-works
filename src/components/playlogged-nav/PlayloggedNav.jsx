import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import profilePic from '../../assets/html-mockups/playlogged-nav/profile-pic.jpg'
import activityIcon from '../../assets/html-mockups/playlogged-nav/activity.svg'
import bookmarkIcon from '../../assets/html-mockups/playlogged-nav/bookmark.svg'
import searchIcon from '../../assets/html-mockups/playlogged-nav/search.svg'
import profileBg from '../../assets/html-mockups/playlogged-nav/Profile.png'
import feedBg from '../../assets/html-mockups/playlogged-nav/Feed.png'
import bookmarksBg from '../../assets/html-mockups/playlogged-nav/Bookmarks.png'
import searchBg from '../../assets/html-mockups/playlogged-nav/Search.png'
import './PlayloggedNav.css'

const TABS = [
  { id: 'profile', type: 'avatar', src: profilePic, bg: profileBg },
  { id: 'activity', type: 'icon', src: activityIcon, bg: feedBg },
  { id: 'bookmarks', type: 'icon', src: bookmarkIcon, bg: bookmarksBg },
  { id: 'search', type: 'icon', src: searchIcon, bg: searchBg },
]

const bgVariants = {
  enter: (dir) => ({ x: `${dir * 100}%`, opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (dir) => ({ x: `${dir * -100}%`, opacity: 0 }),
}

export default function PlayloggedNav() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const [autoCycle, setAutoCycle] = useState(true)
  const resumeTimer = useRef(null)
  const tabRefs = useRef([])
  const navRef = useRef(null)
  const [dotX, setDotX] = useState(0)

  const handleTabChange = (index) => {
    if (index === active) return
    setAutoCycle(false)
    clearTimeout(resumeTimer.current)
    resumeTimer.current = setTimeout(() => setAutoCycle(true), 3000)
    setDirection(index > active ? 1 : -1)
    setActive(index)
  }

  useEffect(() => {
    return () => clearTimeout(resumeTimer.current)
  }, [])

  useEffect(() => {
    if (!autoCycle) return
    const id = setInterval(() => {
      setDirection(1)
      setActive((prev) => (prev + 1) % TABS.length)
    }, 1500)
    return () => clearInterval(id)
  }, [autoCycle])

  const measureDot = useCallback(() => {
    const tab = tabRefs.current[active]
    const nav = navRef.current
    if (tab && nav) {
      const tabRect = tab.getBoundingClientRect()
      const navRect = nav.getBoundingClientRect()
      setDotX(tabRect.left - navRect.left + tabRect.width / 2)
    }
  }, [active])

  useEffect(() => {
    measureDot()
  }, [measureDot])

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const ro = new ResizeObserver(measureDot)
    ro.observe(nav)
    return () => ro.disconnect()
  }, [measureDot])

  return (
    <div className="pn-root">
      <div className="pn-phone">
        {/* Animated background images */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={active}
            src={TABS[active].bg}
            custom={direction}
            variants={bgVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 28,
              mass: 1.4,
            }}
            className="pn-bg"
            draggable={false}
          />
        </AnimatePresence>

        {/* Spacer to push navbar to bottom */}
        <div className="pn-content" />

        {/* Bottom nav bar */}
        <div className="pn-navbar" ref={navRef}>
          <div className="pn-tabs">
            <button
              ref={(el) => (tabRefs.current[0] = el)}
              className={`pn-tab ${active === 0 ? 'pn-tab--active' : ''}`}
              onClick={() => handleTabChange(0)}
            >
              <img src={profilePic} alt="" className="pn-avatar" />
            </button>
            <div className="pn-tabs-right">
              {TABS.slice(1).map((tab, i) => (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[i + 1] = el)}
                  className={`pn-tab ${active === i + 1 ? 'pn-tab--active' : ''}`}
                  onClick={() => handleTabChange(i + 1)}
                >
                  <img src={tab.src} alt="" className="pn-icon" />
                </button>
              ))}
            </div>
          </div>
          {/* Animated dot indicator */}
          <motion.div
            className="pn-dot"
            animate={{ x: dotX }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              mass: 0.8,
            }}
          />
        </div>
      </div>
    </div>
  )
}
