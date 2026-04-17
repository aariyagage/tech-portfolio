import { useRef, useEffect, useState } from 'react'

/**
 * A badge that plays a single shimmer light-sweep when `active` becomes true.
 */
export default function ShimmerBadge({ children, className = '', style = {}, active = false }) {
  const [played, setPlayed] = useState(false)

  useEffect(() => {
    if (active && !played) {
      // Small delay so the section transition settles first
      const t = setTimeout(() => setPlayed(true), 400)
      return () => clearTimeout(t)
    }
  }, [active, played])

  return (
    <span
      className={className}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-block',
      }}
    >
      {children}
      {played && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
            animation: 'shimmer-sweep 0.8s ease-out forwards',
            pointerEvents: 'none',
          }}
        />
      )}
    </span>
  )
}
