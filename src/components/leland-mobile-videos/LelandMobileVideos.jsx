import { useRef, useEffect } from 'react'
import video1 from '../../assets/projects/leland-mobile/Leland-Mobile-1.mp4'
import video2 from '../../assets/projects/leland-mobile/Leland-Mobile-2.mp4'
import video3 from '../../assets/projects/leland-mobile/Leland-Mobile-3.mp4'
import './LelandMobileVideos.css'

const videos = [video1, video2, video3]

export default function LelandMobileVideos() {
  const containerRef = useRef(null)
  const videosRef = useRef([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videosRef.current.forEach(v => v?.play())
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="lmv-container" ref={containerRef}>
      {videos.map((src, i) => (
        <video
          key={i}
          ref={el => videosRef.current[i] = el}
          src={src}
          muted
          loop
          playsInline
          className="lmv-video"
        />
      ))}
    </div>
  )
}
