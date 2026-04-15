import { useRef, useEffect, useCallback } from 'react'

export default function useDragScroll() {
  const ref = useRef(null)
  const state = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    velX: 0,
    prevX: 0,
    rafId: null,
  })

  const momentum = useCallback(() => {
    const el = ref.current
    const s = state.current
    if (!el || Math.abs(s.velX) < 0.5) {
      s.rafId = null
      return
    }
    el.scrollLeft += s.velX
    s.velX *= 0.92
    s.rafId = requestAnimationFrame(momentum)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const s = state.current

    const onDown = (e) => {
      s.isDown = true
      s.startX = e.pageX - el.offsetLeft
      s.scrollLeft = el.scrollLeft
      s.velX = 0
      s.prevX = e.pageX
      el.classList.add('is-dragging')
      if (s.rafId) {
        cancelAnimationFrame(s.rafId)
        s.rafId = null
      }
    }

    const onUp = () => {
      if (!s.isDown) return
      s.isDown = false
      el.classList.remove('is-dragging')
      if (Math.abs(s.velX) > 1) {
        s.rafId = requestAnimationFrame(momentum)
      }
    }

    const onMove = (e) => {
      if (!s.isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = x - s.startX
      el.scrollLeft = s.scrollLeft - walk
      s.velX = s.prevX - e.pageX
      s.prevX = e.pageX
    }

    const onLeave = () => {
      if (s.isDown) onUp()
    }

    el.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)

    return () => {
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      if (s.rafId) cancelAnimationFrame(s.rafId)
    }
  }, [momentum])

  return ref
}
