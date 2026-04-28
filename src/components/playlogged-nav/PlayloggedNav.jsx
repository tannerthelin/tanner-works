import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import profilePic from '../../assets/html-mockups/playlogged-nav/profile-pic.jpg'
import activityIcon from '../../assets/html-mockups/playlogged-nav/activity.svg'
import bookmarkIcon from '../../assets/html-mockups/playlogged-nav/bookmark.svg'
import searchIcon from '../../assets/html-mockups/playlogged-nav/search.svg'
import './PlayloggedNav.css'

const TABS = [
  { id: 'profile', type: 'avatar', src: profilePic },
  { id: 'activity', type: 'icon', src: activityIcon },
  { id: 'bookmarks', type: 'icon', src: bookmarkIcon },
  { id: 'search', type: 'icon', src: searchIcon },
]

export default function PlayloggedNav() {
  const [active, setActive] = useState(0)
  const tabRefs = useRef([])
  const navRef = useRef(null)
  const [dotX, setDotX] = useState(0)

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
        {/* Content area — placeholder for background images */}
        <div className="pn-content">
          <div className="pn-placeholder" />
        </div>

        {/* Bottom nav bar */}
        <div className="pn-navbar" ref={navRef}>
          <div className="pn-tabs">
            <button
              ref={(el) => (tabRefs.current[0] = el)}
              className={`pn-tab ${active === 0 ? 'pn-tab--active' : ''}`}
              onClick={() => setActive(0)}
            >
              <img src={profilePic} alt="" className="pn-avatar" />
            </button>
            <div className="pn-tabs-right">
              {TABS.slice(1).map((tab, i) => (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[i + 1] = el)}
                  className={`pn-tab ${active === i + 1 ? 'pn-tab--active' : ''}`}
                  onClick={() => setActive(i + 1)}
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
