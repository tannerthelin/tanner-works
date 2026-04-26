import { useEffect, useRef } from 'react'
import { animate, cubicBezier } from 'motion/react'

const DURATION = 0.648       // 900ms * 0.72
const STAGGER = 0.018        // 25ms * 0.72
const EASE = cubicBezier(0.22, 1, 0.36, 1)
const Y = 16 * 0.58          // 9.28px
const BLUR = 12

export default function BlurInText({ text, delay = 0, as: Tag = 'h1', ...props }) {
  const ref = useRef(null)
  const controlsRef = useRef([])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const chars = el.querySelectorAll('.blur-char')

    chars.forEach((node) => {
      node.style.opacity = '0'
      node.style.transform = `translate3d(0, ${Y}px, 0)`
      node.style.filter = `blur(${BLUR}px)`
    })

    const timer = setTimeout(() => {
      const ctrls = Array.from(chars).map((node, i) => {
        const ctrl = animate(
          node,
          {
            opacity: [0, 1],
            transform: [`translate3d(0, ${Y}px, 0)`, 'translate3d(0, 0, 0)'],
            filter: [`blur(${BLUR}px)`, 'blur(0px)'],
          },
          {
            duration: DURATION,
            delay: i * STAGGER,
            ease: EASE,
          }
        )
        return ctrl
      })

      controlsRef.current = ctrls

      Promise.all(ctrls).then(() => {
        chars.forEach((n) => {
          n.style.opacity = '1'
          n.style.transform = 'translate3d(0, 0, 0)'
          n.style.filter = 'blur(0px)'
        })
      })
    }, delay * 1000)

    return () => {
      clearTimeout(timer)
      controlsRef.current.forEach((c) => {
        c.stop?.()
        c.cancel?.()
      })
      controlsRef.current = []
    }
  }, [text, delay])

  const lines = text.split('\n')

  return (
    <Tag ref={ref} {...props}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx}>
          {Array.from(line).map((char, charIdx) => (
            <span
              key={charIdx}
              className="blur-char"
              style={{
                display: 'inline-block',
                whiteSpace: 'pre',
                willChange: 'transform, opacity, filter',
                backfaceVisibility: 'hidden',
                transformOrigin: '50% 55%',
              }}
            >
              {char}
            </span>
          ))}
          {lineIdx < lines.length - 1 && <br />}
        </span>
      ))}
    </Tag>
  )
}
