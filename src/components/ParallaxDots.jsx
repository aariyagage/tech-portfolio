import { useState, useCallback } from 'react'

/**
 * Subtle dot grid background that shifts with mouse movement.
 * Must be used inside a parent with `position: relative` and
 * the parent should have onMouseMove/onMouseLeave handlers.
 */
export default function ParallaxDots({ dotColor = 'rgba(63, 224, 106, 0.12)', dotCount = 30, offsetX = 0, offsetY = 0 }) {
  // Deterministic dot positions
  const dots = Array.from({ length: dotCount }, (_, i) => ({
    x: ((i * 37 + 13) % 100),
    y: ((i * 53 + 7) % 100),
    size: 3 + (i % 4),
  }))

  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none"
    >
      <div
        style={{
          position: 'absolute',
          inset: -10,
          transform: `translate(${offsetX}px, ${offsetY}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              borderRadius: '50%',
              background: dotColor,
            }}
          />
        ))}
      </div>
    </div>
  )
}
