import { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProjectPreview({
  href,
  children,
  className = '',
  style = {},
  previewW = 360,
  previewH = 224,
  previewImage = null,
  showChrome = true,
  onClick = null,
}) {
  const [hovered, setHovered] = useState(false)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    setMouse({ x: e.clientX, y: e.clientY })
  }, [])

  const handleMouseEnter = useCallback((e) => {
    setMouse({ x: e.clientX, y: e.clientY })
    setHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHovered(false)
  }, [])

  const offsetX = 20
  const offsetY = 20
  const chromeH = showChrome ? 28 : 0

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick ? (e) => { e.preventDefault(); onClick() } : undefined}
    >
      {children}

      {createPortal(
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="project-preview-tooltip"
              initial={{ opacity: 0, scale: 0.88, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 8 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={(() => {
                const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
                const vh = typeof window !== 'undefined' ? window.innerHeight : 800
                const w = Math.min(previewW, vw - 40)
                const h = previewH + chromeH
                let left = mouse.x + offsetX
                let top = mouse.y + offsetY
                if (left + w > vw - 8) left = Math.max(8, mouse.x - w - offsetX)
                if (top + h > vh - 8) top = Math.max(8, vh - h - 8)
                return {
                  position: 'fixed',
                  left,
                  top,
                  width: w,
                  height: h,
                  zIndex: 9999,
                  pointerEvents: 'none',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow:
                    '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)',
                  background: '#1a1a1a',
                }
              })()}
            >
              {/* Browser chrome bar */}
              {showChrome && (
                <div
                  style={{
                    height: chromeH,
                    background: '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 10,
                    gap: 6,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
                  <span
                    style={{
                      marginLeft: 12,
                      fontSize: 9,
                      fontFamily: 'monospace',
                      color: 'rgba(255,255,255,0.35)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {href}
                  </span>
                </div>
              )}

              {/* Content */}
              <div style={{ width: previewW, height: previewH, overflow: 'hidden' }}>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <iframe
                    src={href}
                    title="Preview"
                    style={{
                      width: 1280,
                      height: 800,
                      transform: `scale(${previewW / 1280})`,
                      transformOrigin: 'top left',
                      border: 'none',
                      pointerEvents: 'none',
                      display: 'block',
                    }}
                    tabIndex={-1}
                    loading="eager"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </a>
  )
}
