import { useEffect, useRef } from 'react'
import { animate, cubicBezier } from 'motion/react'

// soft-blur-in timing (scaled by 0.72, y travel * 0.58)
const ENTER_DURATION = 0.648       // 900 * 0.72
const ENTER_STAGGER = 0.018        // 25 * 0.72
const ENTER_EASE = cubicBezier(0.22, 1, 0.36, 1)
const ENTER_Y = 16 * 0.58          // 9.28px
const ENTER_BLUR = 12

const EXIT_DURATION = 0.432        // 600 * 0.72
const EXIT_STAGGER = 0.011         // 15 * 0.72
const EXIT_EASE = cubicBezier(0.64, 0, 0.78, 0)
const EXIT_Y = -16 * 0.58          // -9.28px
const EXIT_BLUR = 12

const HOLD_MS = 550
const GAP_MS = 320

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

export default function AnimatedGoal({ goals, className }) {
  const containerRef = useRef(null)
  const activeRef = useRef(true)
  const controlsRef = useRef([])

  useEffect(() => {
    activeRef.current = true
    controlsRef.current = []
    const container = containerRef.current
    if (!container) return

    let idx = 0

    const createPhrase = (text) => {
      const title = document.createElement('span')
      title.style.display = 'inline-block'
      title.style.whiteSpace = 'nowrap'

      const chars = Array.from(text)
      const charNodes = []

      chars.forEach((char) => {
        const span = document.createElement('span')
        span.textContent = char
        span.style.display = 'inline-block'
        span.style.whiteSpace = 'pre'
        span.style.willChange = 'transform, opacity, filter'
        span.style.backfaceVisibility = 'hidden'
        span.style.transformOrigin = '50% 55%'
        charNodes.push(span)
        title.appendChild(span)
      })

      return { title, charNodes }
    }

    const applyEnterFrom = (charNodes) => {
      charNodes.forEach((node) => {
        node.style.opacity = '0'
        node.style.transform = `translate3d(0, ${ENTER_Y}px, 0)`
        node.style.filter = `blur(${ENTER_BLUR}px)`
      })
    }

    const runEnter = async (charNodes) => {
      const ctrls = charNodes.map((node, i) => {
        const ctrl = animate(
          node,
          {
            opacity: [0, 1],
            transform: [
              `translate3d(0, ${ENTER_Y}px, 0)`,
              'translate3d(0, 0, 0)',
            ],
            filter: [`blur(${ENTER_BLUR}px)`, 'blur(0px)'],
          },
          {
            duration: ENTER_DURATION,
            delay: i * ENTER_STAGGER,
            ease: ENTER_EASE,
          }
        )
        controlsRef.current.push(ctrl)
        return ctrl
      })

      await Promise.all(ctrls)

      charNodes.forEach((n) => {
        n.style.opacity = '1'
        n.style.transform = 'translate3d(0, 0, 0)'
        n.style.filter = 'blur(0px)'
      })
    }

    const runExit = async (charNodes) => {
      const ctrls = charNodes.map((node, i) => {
        const ctrl = animate(
          node,
          {
            opacity: [1, 0],
            transform: [
              'translate3d(0, 0, 0)',
              `translate3d(0, ${EXIT_Y}px, 0)`,
            ],
            filter: ['blur(0px)', `blur(${EXIT_BLUR}px)`],
          },
          {
            duration: EXIT_DURATION,
            delay: i * EXIT_STAGGER,
            ease: EXIT_EASE,
          }
        )
        controlsRef.current.push(ctrl)
        return ctrl
      })

      await Promise.all(ctrls)
    }

    const loop = async () => {
      container.textContent = ''
      let { title: currentTitle, charNodes: currentChars } = createPhrase(goals[idx])
      applyEnterFrom(currentChars)
      container.appendChild(currentTitle)
      await runEnter(currentChars)

      while (activeRef.current) {
        await sleep(HOLD_MS)
        if (!activeRef.current) break

        await runExit(currentChars)
        if (!activeRef.current) break

        idx = (idx + 1) % goals.length
        const { title: nextTitle, charNodes: nextChars } = createPhrase(goals[idx])
        applyEnterFrom(nextChars)

        container.textContent = ''
        container.appendChild(nextTitle)

        await runEnter(nextChars)
        if (!activeRef.current) break

        currentTitle = nextTitle
        currentChars = nextChars

        await sleep(GAP_MS)
      }
    }

    loop()

    return () => {
      activeRef.current = false
      controlsRef.current.forEach((c) => {
        c.stop?.()
        c.cancel?.()
      })
      controlsRef.current = []
    }
  }, [goals])

  return <span ref={containerRef} className={className} />
}
