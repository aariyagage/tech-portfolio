import { useState, useEffect, useRef } from 'react'

/**
 * Animates a number counting up from 0 to `end`.
 * Triggered by `active` prop OR by scrolling into view. Fires once.
 */
export default function CountUp({ end, duration = 800, suffix = '', className = '', style = {}, active = false }) {
  const [count, setCount] = useState(0)
  const hasPlayed = useRef(false)
  const elRef = useRef(null)

  // Also trigger via IntersectionObserver so it works on mobile scroll
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const shouldPlay = active || inView

  useEffect(() => {
    if (!shouldPlay || hasPlayed.current) return
    hasPlayed.current = true

    const delay = setTimeout(() => {
    const start = performance.now()
    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    }, 350)
    return () => clearTimeout(delay)
  }, [shouldPlay, end, duration])

  return (
    <span ref={elRef} className={className} style={style}>
      {count}{suffix}
    </span>
  )
}
